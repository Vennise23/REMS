<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/dbconn',function(){
    return view('dbconn');
});

require __DIR__.'/auth.php';

Route::get('/apply-property', [PropertyController::class, 'create']);
Route::post('/apply-property', [PropertyController::class, 'store']);
// 添加属性详情页面路由
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/rent', [PropertyController::class, 'showRentPage'])->name('rent');
Route::get('/buy', [PropertyController::class, 'showBuyPage'])->name('buy');

// 添加这个路由来获取属性列表
Route::get('/api/properties', [PropertyController::class, 'index']);

Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);

// 添加新的路由，不影响原有路由
Route::get('/api/properties/nearby', [PropertyController::class, 'searchNearby']);

// 临时路由，用于调试
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







