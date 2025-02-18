<?php

namespace App\Mail\Builder;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProductEmail extends Mailable
{
    use Queueable, SerializesModels;

    private $emailTemplate;
    private $emailData;

    public function __construct($recipient, $subject, $template, $data)
    {
        $this->to($recipient);
        $this->subject = $subject;
        $this->emailTemplate = $template;
        $this->emailData = $data;
    }

    public function build()
    {
        return $this->view($this->emailTemplate)
                    ->with($this->emailData);
    }
} 