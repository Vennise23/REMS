<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = [
        'chat_room_id',
        'sender_id',
        'message',
        'read_at'
    ];

    protected $with = ['sender'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function chatRoom()
    {
        return $this->belongsTo(ChatRoom::class);
    }
} 