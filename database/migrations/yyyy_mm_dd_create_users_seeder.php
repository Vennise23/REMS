<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateUsersSeeder extends Migration
{
    public function up()
    {
        // Add your previous users here
        DB::table('users')->insert([
            [
                'firstname' => 'Weiff',
                'lastname' => 'Yang',
                'email' => 'weiwei.www@gmail.com',
                'password' => Hash::make('password123'), // Replace with actual password
                'phone' => '+8612312345678',
                'ic_number' => 'USER123',
                'age' => 25,
                'born_date' => '1999-01-01',
                'gender' => 'male',
                'address_line_1' => 'Tabuan Heights',
                'city' => 'Kuching',
                'postal_code' => '93350',
                'role' => 'user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Add more users as needed in the same format
        ]);
    }

    public function down()
    {
        DB::table('users')->whereIn('email', [
            'weiwei.www@gmail.com',
            // Add other emails here
        ])->delete();
    }
} 