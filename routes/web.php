<?php


use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AdminController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ThreeController;
use App\Http\Controllers\FileController;


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

// User Profile and Logout routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::get('/dbconn', function () {
    return view('dbconn');
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



require __DIR__ . '/auth.php';

Route::get('/apply-property', [PropertyController::class, 'create']);
Route::post('/apply-property', [PropertyController::class, 'store']);
// 添加属性详情页面路由
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/apply-property', [PropertyController::class, 'create'])->name('apply-property');

Route::get('/buy', function () {
    return Inertia::render('Buy', [
        'auth' => [
            'user' => auth()->user()
        ],
        'properties' => \App\Models\Property::all()
    ]);
})->name('buy');

// 添加这个路由来获取属性列表
Route::get('/api/properties', [PropertyController::class, 'index']);

// 或者如果你想把它放在api路由组中，可以在 routes/api.php 中添加：
Route::get('/properties', [PropertyController::class, 'index']);

Route::get('/api/property/{propertyId}/photos', [PropertyController::class, 'getPropertyPhotos']);

Route::middleware(['auth'])->group(function () {
    // Add this route for fetching users
    Route::get('/users/data', [UserController::class, 'index'])->name('users.data');

    // Your other web routes...
});

//THREE - basic upload and binarization testing.
Route::get('/three/upload', [ThreeController::class, 'showUploadForm'])->name('upload.show');
Route::post('/three/upload', [ThreeController::class, 'handleUpload'])->name('upload.handle');
Route::post('/three/saveUpload', [ThreeController::class, 'saveUploadFiles'])->name('uplaod.save');

//THREE - new :: allow upload multiple files and binarize.
Route::get('/three/uploadFile',[FileController::class,'uploadFile']);
