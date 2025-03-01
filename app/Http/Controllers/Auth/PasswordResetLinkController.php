<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Carbon\Traits\ToStringFormat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\Builder\TemporaryEmailBuilder;
use Carbon\Carbon;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        try {
            // Check if email exist in user db
            if (!DB::table('users')->where('email', $email)->exists()) {
                return redirect()->back()->withErrors([
                    'message' => "Email not exist, please register.",
                ]);
            }

            // Build email
            $builder = new TemporaryEmailBuilder();
            $emailObject = $builder
                ->setRecipient($email)
                ->buildEmail();

            // Store or replace token in database
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => (string) $emailObject->getToken(),
                    'expires_at' => $emailObject->getExpiresAt()->toDateTimeString(),
                    'used' => (int) false,
                    'created_at' => now(),
                ]
            );

            Mail::send($emailObject->getResult());

            return Inertia::render('Auth/ForgotPassword', [
                'flash' => ['message' => __("Reset Link sent successfully.")]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function validateToken(Request $request)
    {
        $email = $request->input('email'); // email is passed as null
        $token = $request->input('token');

        $record = DB::table('password_reset_tokens')
            ->where('token', $token)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Invalid Token, please use the latest link. ',
                'used' => true,
                'email' => ''
            ], 400);
        }

        if ($record->used) {
            return response()->json([
                'message' => 'Token already used. ',
                'used' => true,
                'email' => ''
            ], 400);
        }

        if (Carbon::parse($record->expires_at)->isPast()) {
            return response()->json([
                'message' => 'Token expired. ',
                'used' => true,
                'email' => ''
            ], 400);
        }

        return response()->json([
            'message' => 'Token is valid. ',
            'used' => false,
            'email' => $record->email
        ], 200);
    }
}
