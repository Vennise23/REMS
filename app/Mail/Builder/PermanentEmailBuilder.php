<?php

namespace App\Mail\Builder;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PermanentEmailBuilder extends MailBuilder
{
    private $firstname;
    private $lastname;
    private $tempPassword;

    public function __construct()
    {
        // Any default value declare here.
    }

    public function setUserDetails($firstname, $lastname, $tempPassword)
    {
        // Debug log
        Log::info('PermanentEmailBuilder setUserDetails:', [
            'firstname' => $firstname,
            'lastname' => $lastname,
            'tempPassword' => $tempPassword
        ]);

        $this->firstname = $firstname;
        $this->lastname = $lastname;
        $this->tempPassword = $tempPassword;
        return $this;
    }

    public function setSubject()
    {
        $this->subject = 'Welcome to Our Platform';
        return $this;
    }

    public function setTemplate()
    {
        $this->template = 'emails.welcome';
        return $this;
    }

    public function setData()
    {
        // Generate a one-time token for first-time password setup
        $token = Str::random(64);
        
        // Store token in password_reset_tokens table with used = 0
        DB::table('password_reset_tokens')->insert([
            'email' => $this->recipient,
            'token' => $token,
            'created_at' => now(),
            'used' => 0
        ]);

        // Use the setup-password route instead of reset-password
        $setupPasswordUrl = route('password.setup', [
            'token' => $token,
            'email' => $this->recipient
        ]);

        $this->data = [
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'email' => $this->recipient,
            'password' => $this->tempPassword,
            'resetUrl' => $setupPasswordUrl
        ];

        return $this;
    }
} 