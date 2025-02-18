<?php

namespace App\Mail\Builder;

use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TemporaryEmailBuilder extends MailBuilder
{
    private $token;
    private $expiresAt;

    public function __construct()
    {
        $this->token = Str::random(64);
        $this->expiresAt = Carbon::now()->addMinutes(10);
    }

    public function setSubject()
    {
        $this->subject = 'Reset Password Request';
        return $this;
    }

    public function setTemplate()
    {
        $this->template = 'emails.reset-password'; //point to resources/views/emails/reset-password.blade.php (front end)
        return $this;
    }

    public function setData()
    {
        // Generate token with expiration
        $token = Str::random(64);
        
        // Store token in password_reset_tokens table with used = 0
        DB::table('password_reset_tokens')->insert([
            'email' => $this->recipient,
            'token' => $token,
            'created_at' => now(),
            'used' => 0  // Not used yet
        ]);

        $resetUrl = route('password.reset', ['token' => $token]);  // Use named route

        $this->data = [
            'resetUrl' => $resetUrl,
            'expiresAt' => now()->addMinutes(60)->format('Y-m-d H:i:s')
        ];

        return $this;
    }

    public function getToken()
    {
        return $this->token;
    }

    public function getExpiresAt()
    {
        return $this->expiresAt;
    }
} 