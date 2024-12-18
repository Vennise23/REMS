<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Broadcast;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\PropertyStatusController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\RegisteredUserController;

// Main Route
Route::get('/', function () {
    return Inertia::render('Main', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('main');

// User Profile and Logout routes
Route::middleware('auth')->group(function () {
    Route::get('/profile'
    , [ProfileController::class, 'edit'])->name('profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::get('/dbconn', function () {
    return view('dbconn');
});

Route::get('/three', function () {
    return Inertia::render('EntryPage');
});

// Admin Login
Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('admin.login');
Route::post('/admin/login', [AuthenticatedSessionController::class, 'storeAdmin'])->name('admin.login.store');

// Admin routes with user management
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/users', [AdminController::class, 'manageUsers'])->name('admin.users');
    Route::get('/admin/properties', [AdminController::class, 'manageProperties'])->name('admin.properties');
    Route::get('/properties/data', [AdminController::class, 'propertyTable'])->name('admin.properties.data');
    Route::post('/api/properties/{id}/approve', [AdminController::class, 'approveProperty'])->name('api.properties.approve'); 
    Route::post('/api/properties/{id}/reject', [AdminController::class, 'rejectProperty'])->name('api.properties.reject');

    // User Management routes for admin
    Route::get('/users/data', [UserController::class, 'index'])->name('users.data');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});
Route::get('/admin/pending-count', [AdminController::class, 'getPendingCount'])->name('admin.pendingCount');

Route::middleware(['auth'])->group(function () {
    Route::get('/users/data', [UserController::class, 'index'])->name('users.data');
    Route::get('/chat/{chatRoom}', [ChatController::class, 'showChat'])->name('chat.show');
    Route::get('/my-properties', [PropertyStatusController::class, 'index'])->name('my.properties');
    Route::put('/api/properties/{property}/status', [PropertyStatusController::class, 'updateStatus']);
    Route::get('/api/properties/{property}/potential-buyers', [PropertyStatusController::class, 'getPotentialBuyers']);
    Route::post('/api/chat-rooms/create', [ChatController::class, 'createRoom']);
    Route::delete('/api/properties/{property}', [PropertyController::class, 'destroy']);
});

// Profile routes
Route::middleware(['auth'])->group(function () {
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/check-name', [ProfileController::class, 'checkName'])->name('profile.checkName');
    Route::post('/profile/check-email', [ProfileController::class, 'checkEmail'])->name('profile.checkEmail');
    Route::post('/profile/check-ic', [ProfileController::class, 'checkIC'])->name('profile.checkIC');
    Route::post('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
});

// Buy Route
Route::get('/buy', function () {
    return Inertia::render('Buy', [
        'auth' => [
            'user' => auth()->user()
        ],
        'properties' => \App\Models\Property::all()
    ]);
})->name('buy');
Route::get('/buy', function () {
    return Inertia::render('Buy');
})->name('buy');
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);

// Property Route
Route::middleware(['auth'])->group(function () {
    Route::post('/apply-property', [PropertyController::class, 'store']);
    Route::get('/api/properties', [PropertyController::class, 'index']);
});
Route::get('/property/{id}', [PropertyController::class, 'showInformationById'])->name('property.show');
Route::get('/rent', [PropertyController::class, 'showRentPage'])->name('rent');
Route::get('/buy', [PropertyController::class, 'showBuyPage'])->name('buy');
Route::get('/property', [PropertyController::class, 'GetPropertyList']);

Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);
Route::get('/api/properties/nearby', [PropertyController::class, 'searchNearby']);
Route::get('/check-property-name/{name}', [PropertyController::class, 'checkPropertyName']);
Route::get('/api/search-addresses', [PropertyController::class, 'searchAddresses']);

// GOOGLE API TESTING
// Route::get('/test-google-maps', function () {
//     $apiKey = env('GOOGLE_MAPS_API_KEY');
//     $response = Http::get("https://maps.googleapis.com/maps/api/geocode/json", [
//         'address' => 'JALAN PULAI JAYA 2/9',
//         'key' => $apiKey,
//     ]);

//     if ($response->successful()) {
//         return response()->json($response->json());
//     }

//     return response()->json(['error' => 'API call failed'], 500);
// });

// Route::get('/test-geocode', function () {
//     $placeId = request('place_id');
//     $apiKey = env('GOOGLE_MAPS_API_KEY');

//     $url = "https://maps.googleapis.com/maps/api/geocode/json";

//     $response = Http::get($url, [
//         'place_id' => $placeId,
//         'key' => $apiKey,
//     ]);

//     return response()->json($response->json());
// });

// GOOGLE MAPS API
Route::get('/place-details', function () {
    $placeId = request('place_id');
    $apiKey = env('GOOGLE_MAPS_API_KEY');

    $url = "https://maps.googleapis.com/maps/api/place/details/json";
    $response = Http::get($url, [
        'place_id' => $placeId,
        'key' => $apiKey,
    ]);

    return response()->json($response->json());
});

Route::get('/api/place-autocomplete', function () {
    $query = request('query');
    $type = request('type', 'geocode');
    $apiKey = env('GOOGLE_MAPS_API_KEY');

    $url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    $response = Http::get($url, [
        'input' => $query,
        'key' => $apiKey,
        'types' => $type,
        'language' => 'en',
        'components' => 'country:MY',
    ]);

    return response()->json($response->json());
});

Route::get('/api/geocode', function () {
    $placeId = request('place_id');
    $apiKey = env('GOOGLE_MAPS_API_KEY');

    $url = "https://maps.googleapis.com/maps/api/geocode/json";
    $response = Http::get($url, [
        'place_id' => $placeId,
        'key' => $apiKey,
    ]);

    return response()->json($response->json());
});


// Chat Router
Route::middleware(['auth'])->group(function () {
    Route::get('/api/chat-rooms', [ChatController::class, 'getChatRooms']);
    Route::post('/api/chat-rooms/{chatRoom}/mark-as-read', [ChatController::class, 'markAsRead']);
    Route::get('/api/chat-rooms/{chatRoom}/messages', [ChatController::class, 'getMessages']);
    Route::get('/chat/{chatRoom}', [ChatController::class, 'showChat'])->name('chat.show');
    Route::post('/api/chat-messages', [ChatMessageController::class, 'store']);
    Route::get('/api/chat-rooms/unread-counts', [ChatController::class, 'getUnreadCounts']);
    Route::post('/api/messages/mark-as-read', [ChatController::class, 'markMessagesAsRead']);
});

Broadcast::routes(['middleware' => ['auth:sanctum']]);

require __DIR__ . '/auth.php';

Route::post('/api/check-name', [UserController::class, 'checkNameUniqueness'])
    ->name('users.check-name');

Route::post('/api/check-email', [UserController::class, 'checkEmailUniqueness'])
    ->name('users.check-email');

Route::post('/api/check-ic', [UserController::class, 'checkIcUniqueness'])
    ->name('users.check-ic');

Route::post('/api/check-email', [RegisterController::class, 'checkEmailUniqueness']);

Route::get('/profile', [ProfileController::class, 'show'])->middleware(['auth'])->name('profile.show');

// Password Reset Routes
Route::get('/password-reset/{token}', [ResetPasswordController::class, 'showResetForm'])
    ->name('password.reset')
    ->middleware('web');

Route::get('/forgot-password', function () {
    return Inertia::render('Auth/ForgotPassword');
})
->name('password.request')
->middleware('web');

Route::post('/api/validate-reset-token', [ResetPasswordController::class, 'validateToken'])
    ->name('password.validate.token');

Route::post('/api/reset-password', [ResetPasswordController::class, 'reset'])
    ->name('password.update');

Route::post('/forgot-password', [UserController::class, 'sendResetLinkEmail'])
    ->name('password.email');

// Registration Routes
Route::get('/register', [RegisteredUserController::class, 'create'])
    ->name('register');
Route::post('/register', [RegisteredUserController::class, 'store']);
