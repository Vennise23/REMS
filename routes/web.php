<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ThreeController;
use App\Http\Controllers\FileController;

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\PropertyStatusController;
use App\Http\Controllers\NewLaunchController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Models\User;
use App\Http\Controllers\SellerController;

// Main Route
Route::get('/', function () {
    return Inertia::render('Main', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('main');

Route::get('/dbconn', function () {
    return view('dbconn');
});

Route::get('/three', function () {
    return Inertia::render('EntryPage');
});

// Admin Login
Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('admin.login');
Route::post('/admin/login', [AuthenticatedSessionController::class, 'storeAdmin'])->name('admin.login.store');

// Admin routes with user management and property management
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/users', [AdminController::class, 'manageUsers'])->name('admin.users');
    Route::get('/admin/properties', [AdminController::class, 'manageProperties'])->name('admin.properties');
    Route::get('/properties/data', [AdminController::class, 'propertyTable'])->name('admin.properties.data');
    Route::post('/api/properties/{id}/approve', [AdminController::class, 'approveProperty'])->name('api.properties.approve'); 
    Route::post('/api/properties/{id}/reject', [AdminController::class, 'rejectProperty'])->name('api.properties.reject');
    // User CRUD operations
    Route::post('/admin/users', [AdminController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{id}', [AdminController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{id}', [AdminController::class, 'destroy'])->name('admin.users.destroy');
});
Route::get('/admin/pending-count', [AdminController::class, 'getPendingCount'])->name('admin.pendingCount');

Route::middleware(['auth'])->group(function () {
    Route::get('/users/data', [AdminController::class, 'index'])->name('users.data');
    Route::get('/chat/{chatRoom}', [ChatController::class, 'showChat'])->name('chat.show');
    Route::put('/api/properties/{property}/status', [PropertyStatusController::class, 'updateStatus']);
    Route::get('/api/properties/{property}/potential-buyers', [PropertyStatusController::class, 'getPotentialBuyers']);
    Route::post('/api/chat-rooms/create', [ChatController::class, 'createRoom']);
  
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
// New Launches Page Route
Route::get('/new-launches', [NewLaunchController::class, 'index'])
    ->name('new-launches')
    ->middleware(['web']);
Route::get('/buy', function () {
    return Inertia::render('Buy');
})->name('buy');
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/api/properties', [PropertyController::class, 'index']);
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);

// Property Route
Route::middleware(['auth'])->group(function () {
    Route::get('/api/properties', [PropertyController::class, 'index']);
    Route::get('/api/user-properties', [PropertyController::class, 'getUserProperties']);
});
Route::get('/property/{id}', [PropertyController::class, 'showInformationById'])->name('property.show');
Route::get('/rent', [PropertyController::class, 'showRentPage'])->name('rent');
Route::get('/buy', [PropertyController::class, 'showBuyPage'])->name('buy');
Route::get('/property', [PropertyController::class, 'GetPropertyList']);

Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);
Route::get('/api/properties/nearby', [PropertyController::class, 'searchNearby']);
Route::get('/api/search-addresses', [PropertyController::class, 'searchAddresses']);

Route::get('/notifications', [PropertyController::class, 'getNotifications']);
Route::post('/notifications/{id}/mark-as-read', [PropertyController::class, 'markAsRead']);
Route::delete('/api/properties/{id}', [PropertyController::class, 'deletePropertyBySeller']);
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

Route::post('/api/check-name', [AdminController::class, 'checkNameUniqueness'])
    ->name('users.check-name');

Route::post('/api/check-email', [AdminController::class, 'checkEmailUniqueness'])
    ->name('users.check-email');

Route::post('/api/check-ic', [AdminController::class, 'checkIcAvailability'])
    ->name('users.check-ic');

Route::post('/api/check-email', [RegisterController::class, 'checkEmailUniqueness']);

Route::post('/api/validate-reset-token', [ResetPasswordController::class, 'validateToken'])
    ->name('password.validate.token');

// Registration Routes
Route::get('/register', [RegisteredUserController::class, 'create'])
    ->name('register');
Route::post('/register', [RegisteredUserController::class, 'store']);

//find sellers
Route::get('/find-seller', function () {
    return Inertia::render('FindSeller');
})->name('find-seller');

Route::get('/seller-list', function (Request $request) {
    return Inertia::render('SellerList', [
        'initialFilters' => [
            'region' => $request->region,
            'propertyType' => $request->propertyType,
            'searchTerm' => $request->searchTerm,
        ]
    ]);
})->name('seller.list');

Route::get('/seller/{seller}/properties', function (User $seller) {
    return Inertia::render('SellerProperties', [
        'auth' => ['user' => Auth::user()],
        'seller' => $seller->only(['id', 'firstname', 'lastname', 'profile_picture', 'agency_name']),
    ]);
})->name('seller.properties');

Route::get('/seller-properties', [SellerController::class, 'getSellerProperties'])->name('seller.properties');

Route::get('/seller/{id}', [SellerController::class, 'profile'])->name('seller.profile');

//find sellers
Route::get('/find-seller', function () {
    return Inertia::render('FindSeller');
})->name('find-seller');

Route::get('/seller-list', function (Request $request) {
    return Inertia::render('SellerList', [
        'initialFilters' => [
            'region' => $request->region,
            'propertyType' => $request->propertyType,
            'searchTerm' => $request->searchTerm,
        ]
    ]);
})->name('seller.list');

Route::get('/seller/{seller}/properties', function (User $seller) {
    return Inertia::render('SellerProperties', [
        'auth' => ['user' => Auth::user()],
        'seller' => $seller->only(['id', 'firstname', 'lastname', 'profile_picture', 'agency_name']),
    ]);
})->name('seller.properties');

Route::get('/seller-properties', [SellerController::class, 'getSellerProperties'])->name('seller.properties');

//THREE - basic upload and binarization testing.
Route::get('/three/upload', [ThreeController::class, 'showUploadForm'])->name('upload.show');
Route::post('/three/upload', [ThreeController::class, 'handleUpload'])->name('upload.handle');
Route::post('/three/saveUpload', [ThreeController::class, 'saveUploadFiles'])->name('uplaod.save');

//THREE - new :: allow upload multiple files and binarize.
Route::get('/three/uploadFile',[FileController::class,'showUploadForm'])->name('upload.show');
Route::post('/three/uploadFile',[FileController::class,'uploadFile'])->name('upload.handle');
Route::post('/three/submitUpload',[FileController::class,'submitUploadForm'])->name('upload.submit');
Route::get('/three/binarizeShow',[FileController::class,'showBinarizeForm'])->name('binarize.show');

// Former UserController routes now using AdminController
Route::middleware(['auth'])->group(function () {
    Route::get('/user/profile', [AdminController::class, 'profile'])->name('user.profile');
    Route::post('/user/update', [AdminController::class, 'updateProfile'])->name('user.update');
    Route::get('/seller/{seller}/properties', function (User $seller) {
        return Inertia::render('SellerProperties', [
            'auth' => ['user' => Auth::user()],
            'seller' => $seller->only(['id', 'firstname', 'lastname', 'profile_picture', 'agency_name']),
        ]);
    })->name('seller.properties');
});

// For testing emails view
Route::get('/email/reset', function () {
    return view('emails.reset-password');
});


