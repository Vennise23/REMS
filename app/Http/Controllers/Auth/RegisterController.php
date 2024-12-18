<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeEmail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            // Add other validation rules as needed
        ]);

        // Generate a temporary password if needed
        $temporaryPassword = Str::random(8);
        
        // Generate password reset token
        $token = Str::random(60);

        try {
            // Create the user
            $user = User::create([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'email' => $request->email,
                'password' => Hash::make($temporaryPassword),
                // Add other fields as needed
            ]);

            // Store the reset token
            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => $token,
                'created_at' => now()
            ]);

            // Send welcome email
            Mail::to($user->email)->send(new WelcomeEmail(
                $user->firstname,
                $user->lastname,
                $user->email,
                $temporaryPassword,
                $token
            ));

            return response()->json([
                'message' => 'User registered successfully. Please check your email for login credentials.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error registering user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 