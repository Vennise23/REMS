<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminLoginController extends Controller
{
    // Show the admin login form
    public function showLoginForm()
    {
        return Inertia::render('Auth/AdminLogin'); // Path to AdminLogin.jsx in Pages/Auth
    }

    // Handle the admin login attempt
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        // Attempt to log in using the 'admin' guard
        if (Auth::guard('admin')->attempt($request->only('email', 'password'))) {
            // Redirect to the admin dashboard after successful login
            return redirect()->intended('/admin/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    // Handle admin logout
    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect to the admin login page after logout
        return redirect('/admin/login');
    }
}
