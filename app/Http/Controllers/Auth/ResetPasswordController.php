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

    public function showResetForm(Request $request, $token = null)
    {
        $token = $token ?? $request->token;
        $email = $request->email;
        
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $email
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
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required',
                'password' => 'required|min:8',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if the token exists and is valid
            $tokenData = DB::table('password_reset_tokens')
                ->where('token', $request->token)
                ->where('used', false)
                ->where('created_at', '>', now()->subMinutes(10))
                ->first();

            if (!$tokenData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 400);
            }

            // Update the user's password
            $user = User::where('email', $tokenData->email)->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            DB::beginTransaction();
            try {
                // Update password
                $user->password = Hash::make($request->password);
                $user->save();

                // Mark the token as used
                DB::table('password_reset_tokens')
                    ->where('token', $request->token)
                    ->update(['used' => true]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Password reset successfully'
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error resetting password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 