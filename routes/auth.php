<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MyPropertyController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\ResetPasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::post('validate-token', [PasswordResetLinkController::class, 'validateToken'])
        ->name('password.validate');

    Route::get('reset-password/{token}', [ResetPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('/setup-password', [ResetPasswordController::class, 'setup'])
        ->name('password.setup.submit');
});

// Profile & Account
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])
    ->name('profile.show');

    Route::post('/profile/update', [ProfileController::class, 'update'])
    ->name('profile.update');

    Route::post('/profile/check-name', [ProfileController::class, 'checkName'])
    ->name('profile.checkName');

    Route::post('/profile/check-email', [ProfileController::class, 'checkEmail'])
    ->name('profile.checkEmail');

    Route::post('/profile/check-ic', [ProfileController::class, 'checkIC'])
    ->name('profile.checkIC');

    Route::post('/profile/edit', [ProfileController::class, 'edit'])
    ->name('profile.edit');

    // Route::get('verify-email', EmailVerificationPromptController::class)
    //     ->name('verification.notice');

    // Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
    //     ->middleware(['signed', 'throttle:6,1'])
    //     ->name('verification.verify');

    // Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    //     ->middleware('throttle:6,1')
    //     ->name('verification.send');

    // Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
    //     ->name('password.confirm');

    // Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    // Route::put('password', [PasswordController::class, 'update'])->name('password.update');
});

// My Properties
Route::middleware('auth')->group(function(){
    // My Listing
    Route::get('/my-properties', [MyPropertyController::class, 'showMyPropertyForm'])
    ->name('my.properties');

    // Property Application
    Route::get('/property-management', [MyPropertyController::class, 'showPropertyManagementForm'])
    ->name('manage.property');
    Route::get('/check-property-name/{name}', [MyPropertyController::class, 'isPropertyNameAlreadyExist'])
    ->name('manage.property-name');
    Route::post('/apply-property', [MyPropertyController::class, 'saveNew'])
    ->name('manage.save');
    Route::post('/update-property/{id}', [MyPropertyController::class, 'update'])
    ->name('manage.update');
    Route::delete('/delete-property/{id}', [MyPropertyController::class, 'destroy'])
    ->name('manage.delete');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
