<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserStatus;
use App\Events\UserStatusUpdated;

class UserStatusController extends Controller
{
    public function update(Request $request)
    {
        try {
            $user = auth()->user();
            
            $status = UserStatus::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'is_online' => $request->input('online', true),
                    'location' => $request->input('location'),
                    'last_activity' => now(),
                    'message_sent' => $request->input('message_sent', false)
                ]
            );

            // 获取该用户相关的所有聊天室
            $chatRooms = \App\Models\ChatRoom::where('buyer_id', $user->id)
                ->orWhere('seller_id', $user->id)
                ->get();

            // 向每个聊天室的其他用户广播状态更新
            foreach ($chatRooms as $room) {
                $otherUserId = $room->buyer_id === $user->id ? $room->seller_id : $room->buyer_id;
                broadcast(new UserStatusUpdated($otherUserId, [
                    'online' => true,
                    'location' => $status->location,
                    'message_sent' => $status->message_sent
                ]))->toOthers();
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'online' => true,
                    'location' => $status->location,
                    'message_sent' => $status->message_sent
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating user status: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($userId)
    {
        try {
            $status = UserStatus::where('user_id', $userId)->first();
            
            // 更新判断在线状态的逻辑
            $isOnline = false;
            if ($status) {
                $isOnline = $status->message_sent || 
                    ($status->is_online && $status->last_activity && 
                     $status->last_activity > now()->subSeconds(30));
            }

            return response()->json([
                'online' => $isOnline,
                'location' => $status ? $status->location : null
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting user status: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
} 