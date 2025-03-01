<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Inertia\Response;

class ResetPasswordController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
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
}
