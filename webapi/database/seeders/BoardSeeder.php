<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Board;
use Illuminate\Support\Facades\Hash;

class BoardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user = User::create([
            'name' => 'Usuario de Prueba',
            'email' => 'test@example.com',
            'password' => Hash::make('password') 
        ]);

        Board::create([
            'name' => 'Tablero de Prueba (Seed)',
            'user_id' => $user->id
        ]);

        Board::create([
            'name' => 'Segundo Tablero (Seed)',
            'user_id' => $user->id
        ]);
    }
}