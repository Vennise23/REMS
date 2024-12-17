<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserStatus;
use App\Events\UserStatusUpdated;

class UserStatusController extends Controller
{
    public function update(Request $request)
    {
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

        // 广播状态更新
        broadcast(new UserStatusUpdated($user->id, [
            'online' => true,
            'location' => $status->location,
            'message_sent' => $status->message_sent
        ]));

        return response()->json([
            'status' => 'success',
            'data' => [
                'online' => true,
                'location' => $status->location,
                'message_sent' => $status->message_sent
            ]
        ]);
    }

    public function show($userId)
    {
        $status = UserStatus::where('user_id', $userId)->first();

        // 如果是通过发消息触发的状态更新，或者最后活动时间在30秒内，则认为用户在线
        $isOnline = $status && (
            $status->message_sent || 
            ($status->is_online && $status->last_activity > now()->subSeconds(30))
        );

        return response()->json([
            'online' => $isOnline,
            'location' => $status ? $status->location : null
        ]);
    }
} 