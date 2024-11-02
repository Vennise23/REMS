<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        Admin::create([
            'name' => 'Admin Name',
            'email' => 'admin@example.com', // Use a unique admin email
            'password' => Hash::make('password123'), // Replace with a secure password
        ]);
    }
}

