<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\NewChatMessage;
use Inertia\Inertia;
use App\Notifications\NewMessageNotification;
use App\Events\UnreadMessagesUpdated;
use Illuminate\Support\Facades\Session;
use App\Events\MessageCountUpdated;

class ChatController extends Controller
{
    public function getChatRooms()
    {
        $user = auth()->user();
        
        $chatRooms = ChatRoom::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['buyer:id,firstname', 'seller:id,firstname', 'property:id,property_name'])
            ->get()
            ->map(function ($room) use ($user) {
                // Calculate unread message count for each chat room
                $unreadCount = ChatMessage::where('chat_room_id', $room->id)
                    ->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at')
                    ->count();
                    
                return array_merge($room->toArray(), [
                    'unread_count' => $unreadCount
                ]);
            });

        return response()->json([
            'chatRooms' => $chatRooms,
            'totalUnreadCount' => $chatRooms->sum('unread_count')
        ]);
    }

    public function createRoom(Request $request)
    {
        try {
            $validated = $request->validate([
                'property_id' => 'required|exists:properties,id',
                'seller_id' => 'required|exists:users,id',
            ]);

            $chatRoom = ChatRoom::firstOrCreate([
                'property_id' => $validated['property_id'],
                'buyer_id' => Auth::id(),
                'seller_id' => $validated['seller_id'],
            ]);

            return response()->json([
                'chatRoom' => $chatRoom->load(['buyer', 'seller', 'property']),
                'messages' => $chatRoom->messages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create chat room',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'chat_room_id' => 'required|exists:chat_rooms,id',
            'message' => 'required|string'
        ]);

        $message = ChatMessage::create([
            'chat_room_id' => $validated['chat_room_id'],
            'sender_id' => auth()->id(),
            'message' => $validated['message'],
            'read_at' => null
        ]);

        // 加载关联关系
        $message->load('sender');

        // 广播消息
        broadcast(new NewChatMessage($message));

        return response()->json($message);
    }

    public function show(ChatRoom $chatRoom)
    {
        // 验证用户是否有权限访问该聊天室
        if ($chatRoom->buyer_id !== auth()->id() && $chatRoom->seller_id !== auth()->id()) {
            abort(403);
        }

        // 加载聊天室相关数据
        $chatRoom->load(['buyer:id,firstname', 'seller:id,firstname', 'property:id,property_name']);
        
        // 加载聊天记录
        $messages = $chatRoom->messages()
            ->with('sender:id,firstname')
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Chat/ChatRoom', [
            'chatRoom' => $chatRoom,
            'messages' => $messages
        ]);
    }

    public function showChat(ChatRoom $chatRoom)
    {
        if ($chatRoom->buyer_id !== auth()->id() && $chatRoom->seller_id !== auth()->id()) {
            abort(403);
        }

        // 添加调试信息
        \Log::info('Chat room accessed', [
            'chat_room_id' => $chatRoom->id,
            'user_id' => auth()->id(),
            'is_buyer' => auth()->id() === $chatRoom->buyer_id,
            'is_seller' => auth()->id() === $chatRoom->seller_id
        ]);

        return Inertia::render('Chat/ChatPage', [
            'chatRoom' => $chatRoom->load(['buyer', 'seller', 'property']),
            'messages' => $chatRoom->messages()->with('sender')->orderBy('created_at')->get(),
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    // 添加获取消息历史的方法
    public function getMessages(ChatRoom $chatRoom)
    {
        // 验证用户是否有权限访问该聊天室
        if ($chatRoom->buyer_id !== auth()->id() && $chatRoom->seller_id !== auth()->id()) {
            abort(403);
        }

        // 获取聊天记录，并按时间排序
        $messages = $chatRoom->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function getUnreadCount()
    {
        $user = auth()->user();
        
        // 获取用户所有聊天室的未读消息数
        $unreadCount = ChatMessage::whereHas('chatRoom', function ($query) use ($user) {
            $query->where('buyer_id', $user->id)
                  ->orWhere('seller_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->whereNull('read_at')
        ->count();

        return response()->json(['unreadCount' => $unreadCount]);
    }

    public function markAsRead(Request $request, $roomId)
    {
        $user = Auth::user();
        
        // 只标记当前聊天室的未读消息为已读
        ChatMessage::where('chat_room_id', $roomId)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function sendMessage(Request $request)
    {
        $user = Auth::user();
        $chatRoom = ChatRoom::findOrFail($request->chat_room_id);
        
        $message = $user->messages()->create([
            'chat_room_id' => $chatRoom->id,
            'message' => $request->input('message'),
            'read_at' => null
        ]);

        // 获取接收者
        $recipient = $user->id === $chatRoom->buyer_id 
            ? $chatRoom->seller 
            : $chatRoom->buyer;

        // 如果接收者当前正在这个聊天室，则自动标记为已读
        if ($this->isUserInChatRoom($recipient->id, $chatRoom->id)) {
            $message->update(['read_at' => now()]);
        }

        // 广播新消息
        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json($message);
    }

    // 新增方法：获取特定聊天室的未读消息数
    private function getUnreadCountForRoom($roomId, $userId)
    {
        return ChatMessage::where('chat_room_id', $roomId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }

    // 检查用户是否在特定聊天室
    private function isUserInChatRoom($userId, $roomId)
    {
        return Session::where('user_id', $userId)
            ->where('last_activity', '>', now()->subMinutes(2))
            ->where('payload', 'LIKE', '%"url":"' . url("/chat/{$roomId}") . '"%')
            ->exists();
    }
} 