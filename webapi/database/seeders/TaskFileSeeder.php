<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\User;
use App\Models\TaskFile;

class TaskFileSeeder extends Seeder
{
    public function run()
    {
        $task = Task::first();
        
        $user = User::where('email', 'user@test.com')->first() ?? User::first();

        if (!$task || !$user) {
            return;
        }

        TaskFile::create([
            'task_id' => $task->id,
            'uploaded_by_user_id' => $user->id,
            'file_path' => 'task_files/requerimientos_v1.pdf',
            'file_name' => 'Requerimientos del Cliente.pdf',
            'file_mime_type' => 'application/pdf'
        ]);

        TaskFile::create([
            'task_id' => $task->id,
            'uploaded_by_user_id' => $user->id,
            'file_path' => 'task_files/mockup_login.png',
            'file_name' => 'Mockup Pantalla Login.png',
            'file_mime_type' => 'image/png'
        ]);
    }
}