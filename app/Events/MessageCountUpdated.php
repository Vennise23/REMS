<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\ChatMessage;

class MessageCountUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $chatRoomId;

    public function __construct($user, $chatRoomId = null)
    {
        $this->user = $user;
        $this->chatRoomId = $chatRoomId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('App.Models.User.' . $this->user->id);
    }

    public function broadcastAs()
    {
        return 'message.count.updated';
    }

    public function broadcastWith()
    {
        // 获取最新的未读消息计数
        $unreadCount = ChatMessage::where('sender_id', '!=', $this->user->id)
            ->whereNull('read_at')
            ->count();

        return [
            'userId' => $this->user->id,
            'unreadCount' => $unreadCount,
            'timestamp' => now()->timestamp
        ];
    }
} 