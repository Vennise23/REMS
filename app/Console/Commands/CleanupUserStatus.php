<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserStatus;
use App\Events\UserStatusUpdated;

class CleanupUserStatus extends Command
{
    protected $signature = 'users:cleanup-status';
    protected $description = 'Cleanup inactive user statuses';

    public function handle()
    {
        try {
            $inactiveUsers = UserStatus::where('is_online', true)
                ->where(function ($query) {
                    $query->where('message_sent', false)
                        ->where(function ($q) {
                            $q->whereNull('last_activity')
                                ->orWhere('last_activity', '<', now()->subSeconds(45));
                        });
                })
                ->get();

            foreach ($inactiveUsers as $status) {
                if ($status->last_activity && $status->last_activity > now()->subSeconds(30)) {
                    continue;
                }

                $status->update([
                    'is_online' => false,
                    'location' => null,
                    'last_activity' => null,
                    'message_sent' => false
                ]);

                // 广播状态更新
                $chatRooms = \App\Models\ChatRoom::where('buyer_id', $status->user_id)
                    ->orWhere('seller_id', $status->user_id)
                    ->get();

                foreach ($chatRooms as $room) {
                    $otherUserId = $room->buyer_id === $status->user_id ? $room->seller_id : $room->buyer_id;
                    broadcast(new UserStatusUpdated($otherUserId, [
                        'online' => false,
                        'location' => null,
                        'message_sent' => false
                    ]))->toOthers();
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error in CleanupUserStatus command: ' . $e->getMessage());
        }
    }
} 