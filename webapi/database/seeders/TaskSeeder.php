<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lista; 
use App\Models\User;
use App\Models\Task;

class TaskSeeder extends Seeder
{
    public function run()
    {
        $lista = Lista::first(); 
        $user = User::first();

        if (!$lista || !$user) {
            return;
        }

        Task::create([
            'title' => 'Tarea de prueba 1',
            'description' => 'Descripción generada por el seeder',
            'list_id' => $lista->id,
            'user_id' => $user->id
        ]);
    }
}