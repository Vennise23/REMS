<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserStatus extends Model
{
    protected $table = 'user_status';
    
    protected $fillable = [
        'user_id',
        'is_online',
        'location',
        'last_activity'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 