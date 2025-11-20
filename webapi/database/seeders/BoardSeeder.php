<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Board;
use App\Models\User;

class BoardSeeder extends Seeder
{
    public function run()
    {
        $user = User::where('email', 'user@test.com')->first();

        // creamos tableros
        Board::create([
            'name' => 'Proyecto Bufalo (Dev)',
            'user_id' => $user->id
        ]);

        Board::create([
            'name' => 'Marketing y Ventas',
            'user_id' => $user->id
        ]);

    }
}