<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

return new class extends Migration
{
    public function up()
    {
        User::create([
            'firstname' => 'Admin',
            'lastname' => 'User',
            'email' => 'admin@example.com',
            'password' => Hash::make('12345678'),
            'phone' => '0123456789',
            'ic_number' => 'ADMIN123',
            'age' => 25,
            'born_date' => '1999-01-01',
            'gender' => 'male',
            'address_line_1' => 'Admin Street',
            'city' => 'Admin City',
            'postal_code' => '12345',
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    public function down()
    {
        DB::table('users')->where('email', 'admin@example.com')->delete();
    }
}; 