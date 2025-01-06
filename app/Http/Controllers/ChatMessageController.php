<?php

namespace App\Http\Controllers;

use App\Events\NewChatMessage;
use App\Models\ChatMessage;
use Illuminate\Http\Request;

class ChatMessageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'chat_room_id' => 'required|exists:chat_rooms,id',
            'message' => 'required|string'
        ]);

        try {
            $message = ChatMessage::create([
                'chat_room_id' => $request->chat_room_id,
                'sender_id' => auth()->id(),
                'message' => $request->message,
            ]);

            $message->load('sender');

            broadcast(new NewChatMessage($message))->toOthers();

            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }
} 