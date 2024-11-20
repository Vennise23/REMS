<?php

use App\Http\Controllers\PropertyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Models\User;
use App\Http\Controllers\ValidationController;





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
Route::put('/users/{id}', [UserController::class, 'update']);

//PropertyList
Route::get('/property', [PropertyController::class, 'GetPropertyList']);

//check existing user
Route::get('/existing-users', function (Request $request) {
    return User::select('firstname', 'lastname', 'email')->get();
});

Route::middleware('api')->group(function () {
    Route::get('/users/data', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/check-name-availability', [ValidationController::class, 'checkNameAvailability']);
    Route::post('/check-email-availability', [ValidationController::class, 'checkEmailAvailability']);
});
