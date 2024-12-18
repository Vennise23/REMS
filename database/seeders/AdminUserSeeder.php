<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'firstname' => 'Admin',
            'lastname' => 'User',
            'email' => 'admin@example.com',
            'password' => Hash::make('12345678'),
            'ic_number' => '123456789012',
            'age' => 35,
            'born_date' => Carbon::parse('1985-01-01'),
            'phone' => '012-3456789',
            'profile_picture' => null,
            'address_line_1' => '123 Main St',
            'address_line_2' => 'Apt 4B',
            'city' => 'Metropolis',
            'postal_code' => '54321',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
    }
}