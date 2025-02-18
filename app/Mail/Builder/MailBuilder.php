<?php

namespace App\Mail\Builder;

abstract class MailBuilder
{
    protected $email;
    protected $subject;
    protected $recipient;
    protected $template;
    protected $data = [];

    abstract public function setSubject();
    abstract public function setTemplate();
    abstract public function setData();

    public function setRecipient($email)
    {
        $this->recipient = $email;
        return $this;
    }

    public function getResult(): ProductEmail
    {
        return new ProductEmail(
            $this->recipient,
            $this->subject,
            $this->template,
            $this->data
        );
    }

    public function buildEmail()
    {
        $this->setSubject()
             ->setTemplate()
             ->setData();
        return $this;
    }
} 