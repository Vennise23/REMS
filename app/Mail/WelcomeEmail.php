<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $firstname;
    public $lastname;
    public $email;
    public $temporaryPassword;
    public $token;
    public $resetUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($firstname, $lastname, $email, $temporaryPassword, $token)
    {
        $this->firstname = $firstname;
        $this->lastname = $lastname;
        $this->email = $email;
        $this->temporaryPassword = $temporaryPassword;
        $this->resetUrl = url(route('password.reset', [
            'token' => $token,
            'email' => $email,
        ], false));
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Welcome to ' . config('app.name'))
                    ->view('emails.welcome');
    }
}
