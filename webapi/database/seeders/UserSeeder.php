<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'), 
            'role' => 'admin',
        ]);

        //user
        User::create([
            'name' => 'Juan Pérez',
            'email' => 'user@test.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

    }
}