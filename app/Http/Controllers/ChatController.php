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
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function getChatRooms(Request $request)
    {
        $user = auth()->user();
        
        $chatRooms = ChatRoom::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['buyer:id,firstname', 'seller:id,firstname', 'property:id,property_name'])
            ->get()
            ->map(function ($room) use ($user) {
                $unreadCount = ChatMessage::where('chat_room_id', $room->id)
                    ->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at')
                    ->count();
                    
                return [
                    'id' => $room->id,
                    'property' => $room->property,
                    'buyer' => $room->buyer,
                    'seller' => $room->seller,
                    'unread_count' => $unreadCount,
                    'other_user' => $user->id === $room->buyer_id ? $room->seller : $room->buyer
                ];
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

            // 检查用户是否试图与自己聊天
            if (Auth::id() === $validated['seller_id']) {
                return response()->json([
                    'error' => 'You cannot create a chat room with yourself'
                ], 400);
            }

            // 检查是否已存在聊天室
            $existingRoom = ChatRoom::where('property_id', $validated['property_id'])
                ->where(function ($query) use ($validated) {
                    $query->where(function ($q) use ($validated) {
                        $q->where('buyer_id', Auth::id())
                          ->where('seller_id', $validated['seller_id']);
                    })->orWhere(function ($q) use ($validated) {
                        $q->where('seller_id', Auth::id())
                          ->where('buyer_id', $validated['seller_id']);
                    });
                })
                ->first();

            if ($existingRoom) {
                return response()->json([
                    'success' => true,
                    'chatRoom' => $existingRoom->load(['buyer', 'seller', 'property']),
                ]);
            }

            // 创建新的聊天室
            $chatRoom = ChatRoom::create([
                'property_id' => $validated['property_id'],
                'buyer_id' => Auth::id(),
                'seller_id' => $validated['seller_id'],
            ]);

            return response()->json([
                'success' => true,
                'chatRoom' => $chatRoom->load(['buyer', 'seller', 'property']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in createRoom: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create chat room',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request, ChatRoom $chatRoom)
    {
        try {
            $validated = $request->validate([
                'chat_room_id' => 'required|exists:chat_rooms,id',
                'message' => 'required|string'
            ]);

            $message = ChatMessage::create([
                'chat_room_id' => $validated['chat_room_id'],
                'sender_id' => auth()->id(),
                'message' => $validated['message']
            ]);

            // Get the message recipient
            $recipient = $chatRoom->buyer_id === auth()->id() 
                ? $chatRoom->seller 
                : $chatRoom->buyer;

            // Broadcast new message event
            broadcast(new NewChatMessage($message))->toOthers();
            // Broadcast unread message count update event
            broadcast(new MessageCountUpdated($recipient, $chatRoom->id))->toOthers();

            return response()->json($message);
        } catch (\Exception $e) {
            Log::error('Error in store method: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(ChatRoom $chatRoom)
    {
        // Verify if user has permission to access this chat room
        if ($chatRoom->buyer_id !== auth()->id() && $chatRoom->seller_id !== auth()->id()) {
            abort(403);
        }

        // Load chat room related data
        $chatRoom->load(['buyer:id,firstname', 'seller:id,firstname', 'property:id,property_name']);
        
        // Load chat messages
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

        // Add debugging information
        Log::info('Chat room accessed', [
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

    // Add method to get message history
    public function getMessages(ChatRoom $chatRoom)
    {
        // Verify if user has permission to access this chat room
        if ($chatRoom->buyer_id !== auth()->id() && $chatRoom->seller_id !== auth()->id()) {
            abort(403);
        }

        // Get chat messages and sort by time
        $messages = $chatRoom->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function getUnreadCounts()
    {
        $user = auth()->user();
        $unreadCounts = [];
        
        // Get unread message counts for all chat rooms of the user
        $chatRooms = ChatRoom::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->get();

        foreach ($chatRooms as $room) {
            $unreadCounts[$room->id] = ChatMessage::where('chat_room_id', $room->id)
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->count();
        }

        return response()->json($unreadCounts);
    }

    public function markMessagesAsRead(Request $request)
    {
        $messageIds = $request->input('message_ids', []);
        
        ChatMessage::whereIn('id', $messageIds)
            ->where('sender_id', '!=', auth()->id())
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

        // If recipient is currently in this chat room, mark as read automatically
        $recipient = $user->id === $chatRoom->buyer_id ? $chatRoom->seller : $chatRoom->buyer;
        if ($this->isUserInChatRoom($recipient->id, $chatRoom->id)) {
            $message->update(['read_at' => now()]);
        }

        broadcast(new NewChatMessage($message))->toOthers();
        return response()->json($message);
    }

    // Add method to get unread message count for a specific chat room
    private function getUnreadCountForRoom($roomId, $userId)
    {
        return ChatMessage::where('chat_room_id', $roomId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }

    // Check if user is in a specific chat room
    private function isUserInChatRoom($userId, $roomId)
    {
        return Session::where('user_id', $userId)
            ->where('last_activity', '>', now()->subMinutes(2))
            ->where('payload', 'LIKE', '%"url":"' . url("/chat/{$roomId}") . '"%')
            ->exists();
    }

    public function markAsRead(ChatRoom $chatRoom)
    {
        try {
            if ($chatRoom->buyer_id !== auth()->id() && $chatRoom->seller_id !== auth()->id()) {
                throw new \Exception('Unauthorized access to chat room');
            }

            // 标记所有接收到的消息为已读
            ChatMessage::where('chat_room_id', $chatRoom->id)
                ->where('sender_id', '!=', auth()->id())
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            // 广播消息计数更新
            broadcast(new MessageCountUpdated(auth()->user()))->toOthers();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error marking messages as read: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
} 