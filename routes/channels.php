<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
    $chatRoom = \App\Models\ChatRoom::find($roomId);
    return $chatRoom && ($user->id === $chatRoom->buyer_id || $user->id === $chatRoom->seller_id);
});

Broadcast::channel('user-status.{userId}', function ($user, $userId) {
    return true; // 允许所有认证用户订阅
});
