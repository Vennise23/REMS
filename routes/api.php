<?php

use App\Http\Controllers\PropertyController;
use App\Http\Controllers\APIController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Http\Controllers\ValidationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UserStatusController;
use App\Http\Controllers\NewLaunchController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\DB;





/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//edit user
Route::put('/users/{id}', [AdminController::class, 'update']);

//PropertyList
Route::get('/property', [PropertyController::class, 'GetPropertyList']);

//check existing user
Route::get('/existing-users', [AdminController::class, 'getExistingUsers']);

Route::middleware('api')->group(function () {
    Route::get('/users/data', [AdminController::class, 'index']);
    Route::post('/users', [AdminController::class, 'store']);
    Route::delete('/users/{id}', [AdminController::class, 'destroy']);
    Route::post('/check-name-availability', [ValidationController::class, 'checkNameAvailability']);
    Route::post('/check-email-availability', [AdminController::class, 'checkEmailAvailability']);
    Route::post('/users/{id}', [AdminController::class, 'update']);
});

Route::get('/proxy/nominatim', [APIController::class,'getAddress']);

Route::middleware(['auth:sanctum', 'web'])->group(function () {
    Route::get('/chat-rooms', [ChatController::class, 'getChatRooms']);
    Route::post('/chat-rooms', [ChatController::class, 'createRoom']);
    Route::post('/chat-rooms/{chatRoom}/messages', [ChatController::class, 'store'])
        ->name('chat.messages.store');
    Route::get('/chat-rooms/{chatRoom}/messages', [ChatController::class, 'getMessages']);
    Route::get('/unread-messages/count', [ChatController::class, 'getUnreadCount']);
    Route::post('/chat-rooms/{chatRoom}/mark-as-read', [ChatController::class, 'markAsRead']);
    Route::post('/chat-rooms/create', [ChatController::class, 'createRoom']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/user/status', [UserStatusController::class, 'update']);
    Route::get('/user-status/{userId}', [UserStatusController::class, 'show']);
});

// New Launches API Route
Route::get('/new-launches', [NewLaunchController::class, 'getNewLaunches']);

Route::post('/check-name-availability', function (Request $request) {
    $exists = User::where('firstname', $request->firstname)
                 ->where('lastname', $request->lastname)
                 ->exists();
    
    return response()->json(['available' => !$exists]);
});

Route::post('/check-ic-availability', [AdminController::class, 'checkIcAvailability']);

Route::post('/check-name', 'AdminController@checkNameUniqueness');
Route::post('/check-email', 'AdminController@checkEmailUniqueness');
Route::post('/check-ic', 'AdminController@checkICUniqueness');
Route::post('/check-passport', 'AdminController@checkPassportUniqueness');

//send welcome email to new user
Route::post('/send-welcome-email', [AdminController::class, 'sendWelcomeEmail']);

Route::post('/validate-reset-token', function (Request $request) {
    $tokenData = DB::table('password_reset_tokens')
        ->where('token', $request->token)
        ->where('email', $request->email)
        ->first();

    return response()->json([
        'valid' => $tokenData !== null,
        'used' => $tokenData ? $tokenData->used : 1
    ]);
});

Route::post('/reset-password', [ResetPasswordController::class, 'reset']);

Route::get('/search-sellers', [SellerController::class, 'search']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/seller-properties', [SellerController::class, 'getSellerProperties']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    // User management routes (now in AdminController)
    Route::get('/check-ic-availability', [AdminController::class, 'checkIcAvailability']);
    Route::post('/check-name-uniqueness', [AdminController::class, 'checkNameUniqueness']);
    Route::post('/check-email-uniqueness', [AdminController::class, 'checkEmailUniqueness']);
    Route::post('/send-welcome-email', [AdminController::class, 'sendWelcomeEmail']);
    Route::post('/update-status', [AdminController::class, 'updateStatus']);
    Route::get('/user-status/{userId}', [AdminController::class, 'getUserStatus']);

    // Admin routes
    Route::get('/admin/pending-count', [AdminController::class, 'getPendingCount']);
    Route::get('/admin/property-table', [AdminController::class, 'propertyTable']);
    Route::post('/admin/approve-property/{id}', [AdminController::class, 'approveProperty']);
    Route::post('/admin/reject-property/{id}', [AdminController::class, 'rejectProperty']);
});

