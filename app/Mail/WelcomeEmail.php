<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $firstname;
    public $lastname;
    public $email;
    public $password;
    public $token;
    public $resetUrl;

    public function __construct($firstname, $lastname, $email, $password, $token)
    {
        $this->firstname = $firstname;
        $this->lastname = $lastname;
        $this->email = $email;
        $this->password = $password;
        $this->token = $token;
        
        // Update to use password-reset instead of reset-password
        $this->resetUrl = url("/password-reset/{$this->token}?email=" . urlencode($this->email));
    }

    public function build()
    {
        return $this->view('emails.welcome')
                    ->subject('Welcome to ' . config('app.name'));
    }
}
