<?php


use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AdminController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

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

Route::get('/apply-property', [PropertyController::class, 'create']);
Route::post('/apply-property', [PropertyController::class, 'store']);

Route::get('/apply-property', [PropertyController::class, 'create'])->name('apply-property');

Route::post('/profile/check-email', [ProfileController::class, 'checkEmail'])->name('profile.checkEmail');



require __DIR__.'/auth.php';

Route::get('/apply-property', [PropertyController::class, 'create']);
Route::post('/apply-property', [PropertyController::class, 'store']);

Route::get('/apply-property', [PropertyController::class, 'create'])->name('apply-property');

Route::get('/buy', function () {
    return Inertia::render('Buy');
})->name('buy');
// 添加属性详情页面路由
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
// 添加这个路由来获取属性列表
Route::get('/api/properties', [PropertyController::class, 'index']);
// 或者如果你想把它放在api路由组中，可以在 routes/api.php 中添加：
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
    // Add this route for fetching users
    Route::get('/users/data', [UserController::class, 'index'])->name('users.data');
    
    // Your other web routes...
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

require __DIR__.'/auth.php';











