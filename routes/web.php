<?php


use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AdminController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Http;

// Main Route
Route::get('/', function () {
    return Inertia::render('Main', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('main');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// User Profile and Logout routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::get('/dbconn', function () {
    return view('dbconn');
});

Route::get('/three',function(){
    return Inertia::render('EntryPage');
});

// Admin Login
Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('admin.login');
Route::post('/admin/login', [AuthenticatedSessionController::class, 'storeAdmin'])->name('admin.login.store');

// Admin routes with user management
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/users', [AdminController::class, 'manageUsers'])->name('admin.users');

    // User Management routes for admin
    Route::get('/users/data', [UserController::class, 'index'])->name('users.data');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// Profile routes
Route::post('/profile/check-email', [ProfileController::class, 'checkEmail'])->name('profile.checkEmail');


Route::get('/buy', function () {
    return Inertia::render('Buy');
})->name('buy');
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/api/properties', [PropertyController::class, 'index']);
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);

// Buy Route
Route::get('/buy', function () {
    return Inertia::render('Buy', [
        'auth' => [
            'user' => auth()->user()
        ],
        'properties' => \App\Models\Property::all()
    ]);
})->name('buy');

// Property Route
Route::post('/apply-property', [PropertyController::class, 'store']);
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/rent', [PropertyController::class, 'showRentPage'])->name('rent');
Route::get('/buy', [PropertyController::class, 'showBuyPage'])->name('buy');
Route::get('/property', [PropertyController::class, 'GetPropertyList']);

Route::get('/api/properties', [PropertyController::class, 'index']);
Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);

Route::middleware(['auth'])->group(function () {
    Route::get('/users/data', [UserController::class, 'index'])->name('users.data');
});

Route::get('/api/properties/nearby', [PropertyController::class, 'searchNearby']);

// Testing
Route::get('/debug/properties', function () {
    $properties = \App\Models\Property::all();
    return response()->json([
        'properties' => $properties->map(function ($property) {
            return [
                'id' => $property->id,
                'property_name' => $property->property_name,
                'amenities' => $property->amenities
            ];
        })
    ]);
});

// GOOGLE API TESTING
Route::get('/test-google-maps', function () {
    $apiKey = env('GOOGLE_MAPS_API_KEY');
    $response = Http::get("https://maps.googleapis.com/maps/api/geocode/json", [
        'address' => 'JALAN PULAI JAYA 2/9',
        'key' => $apiKey,
    ]);

    if ($response->successful()) {
        return response()->json($response->json());
    }

    return response()->json(['error' => 'API call failed'], 500);
});

Route::get('/test-geocode', function () {
    $placeId = request('place_id');
    $apiKey = env('GOOGLE_MAPS_API_KEY');

    $url = "https://maps.googleapis.com/maps/api/geocode/json";

    $response = Http::get($url, [
        'place_id' => $placeId,
        'key' => $apiKey,
    ]);

    return response()->json($response->json());
});

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

require __DIR__.'/auth.php';











