<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Board;
use App\Models\Lista;

class ListaSeeder extends Seeder
{
    public function run()
    {
        $board = Board::first();

        if (!$board) {
            return; 
        }

        $nombres = ['Por hacer', 'En proceso', 'Revisión', 'Terminado'];

        foreach ($nombres as $nombre) {
            Lista::create([
                'title' => $nombre,
                'board_id' => $board->id
            ]);
        }
    }
}