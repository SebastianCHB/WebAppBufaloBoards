<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskFile;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskFileController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'file' => 'required|file|max:51200'
        ]);

        $user = $request->user(); 

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $task = Task::findOrFail($request->task_id);
        
        if ($task->user_id && $task->user_id !== $user->id) {
            return response()->json(['message' => 'Solo puedes subir archivos a tus propias tareas.'], 403);
        }

        if ($request->hasFile('file')) {
            try {
                $file = $request->file('file');
                $path = $file->store('uploads', 'public');

                $taskFile = TaskFile::create([
                    'task_id' => $request->task_id,
                    'uploaded_by_user_id' => $user->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_mime_type' => $file->getClientMimeType()
                ]);

                return response()->json($taskFile, 201);

            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    public function download($id)
    {
        $file = TaskFile::findOrFail($id);
        
        if (!Storage::disk('public')->exists($file->file_path)) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return Storage::disk('public')->download($file->file_path, $file->file_name);
    }

    public function destroy($id)
    {
        $file = TaskFile::findOrFail($id);

        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }
        
        $file->delete();
        return response()->json(['message' => 'Deleted']);
    }
}