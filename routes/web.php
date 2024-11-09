<?php


use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\AdminController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;

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

// Route::middleware(['web', 'auth:admin'])->post('/admin/logout', [AdminLoginController::class, 'logout'])->name('admin.logout');


// Admin Authentication Routes

// Admin routes for managing user
Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
// Route::get('/users', [AdminController::class, 'manageUsers'])->name('admin.users');
Route::get('/admin/users', [AdminController::class, 'manageUsers'])->name('admin.users');



//user data show
Route::get('/users/data', [UserController::class, 'index'])->name('users.data');
//add user
Route::post('/users', [UserController::class, 'store'])->name('users.store');

// Routes for user management
Route::get('/users', [UserController::class, 'index']);
// Route::put('/api/users/{id}', [UserController::class, 'update']);

Route::delete('/users/{id}', [UserController::class, 'destroy']);



require __DIR__.'/auth.php';
