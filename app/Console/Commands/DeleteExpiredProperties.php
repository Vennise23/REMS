<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Property;
use App\Models\ChatRoom;
use Carbon\Carbon;

class DeleteExpiredProperties extends Command
{
    protected $signature = 'properties:delete-expired';
    protected $description = 'Delete properties and related chats that have been sold/rented/cancelled for more than 5 days';

    public function handle()
    {
        // 找出所有状态改变超过5天的属性
        $expiredProperties = Property::whereIn('status', ['sold', 'rented', 'cancelled'])
            ->where('transaction_date', '<', Carbon::now()->subDays(5))
            ->get();

        foreach ($expiredProperties as $property) {
            // 删除相关的聊天室和消息
            ChatRoom::where('property_id', $property->id)->delete();
            
            // 删除属性
            $property->delete();

            $this->info("Deleted property {$property->id} and its related chats");
        }

        $this->info('Expired properties cleanup completed');
    }
} 