<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class ResetPasswordController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    public function showResetForm(string $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => request('email')
        ]);
    }

    public function showSetupForm(string $token)
    {
        $tokenData = DB::table('password_reset_tokens')
            ->where('token', $token)
            ->first();

        if (!$tokenData || $tokenData->used === 1) {
            return Inertia::render('Auth/InvalidToken');
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $tokenData->email
        ]);
    }

    public function validateToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email'
        ]);

        $tokenData = DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->where('email', $request->email)
            ->first();

        if (!$tokenData) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid token'
            ], 400);
        }

        if ($tokenData->used) {
            return response()->json([
                'valid' => false,
                'message' => 'Token has already been used'
            ], 400);
        }

        $createdAt = Carbon::parse($tokenData->created_at);
        if ($createdAt->addMinutes(10)->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'Token has expired'
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Token is valid'
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $tokenData = DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->where('used', 0)
            ->first();

        if (!$tokenData) {
            return back()->withErrors(['token' => 'Invalid token']);
        }

        // Update password and mark token as used
        $user = User::where('email', $tokenData->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->update(['used' => 1]);

        return redirect()->route('login')->with('status', 'Password has been reset!');
    }

    public function setup(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $tokenData = DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->where('used', 0)
            ->first();

        if (!$tokenData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 400);
        }

        // Update password
        $user = User::where('email', $tokenData->email)->first();
        $user->password = Hash::make($request->password);
        $user->email_verified_at = now();
        $user->save();

        // Mark token as used
        DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->update(['used' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Password has been set successfully!'
        ]);
    }

    public function createToken(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $token = Str::random(64);
        
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $token,
            'created_at' => now(),
            'expires_at' => now()->addHours(1),
            'used' => 0
        ]);

        Mail::send('emails.reset-password', [
            'url' => route('password.reset', $token)
        ], function($message) use ($request) {
            $message->to($request->email)
                    ->subject('Reset Password Notification');
        });

        return back()->with('status', 'Password reset link sent!');
    }
} 