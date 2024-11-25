<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\ChatMessage;
use Illuminate\Http\Request;

class ChatMessageController extends Controller
{
    public function store(Request $request)
    {
        $message = ChatMessage::create([
            'chat_room_id' => $request->chat_room_id,
            'sender_id' => auth()->id(),
            'message' => $request->message,
        ]);

        $message->load('sender');

        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json($message);
    }
} 