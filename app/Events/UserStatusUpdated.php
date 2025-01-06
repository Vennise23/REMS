<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $status;
    public $userId;

    public function __construct($userId, $status)
    {
        $this->userId = $userId;
        $this->status = $status;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user-status.' . $this->userId);
    }

    public function broadcastWith()
    {
        return [
            'status' => [
                'online' => $this->status['online'],
                'location' => $this->status['location']
            ]
        ];
    }

    public function broadcastAs()
    {
        return 'user.status';
    }
} 