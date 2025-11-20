<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Lista;
use App\Models\TaskFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->list_id) {
            return response()->json(['error' => 'list_id is required'], 400);
        }

        $lista = Lista::find($request->list_id);

        if (!$lista || $lista->board->user_id != Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $tasks = Task::where('list_id', $request->list_id)->with('files')->get();
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'list_id' => 'required|exists:lists,id',
            'file' => 'nullable|file|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $lista = Lista::find($request->list_id);
        if ($lista->board->user_id != Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'list_id' => $request->list_id,
            'user_id' => Auth::id()
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('task_files', 'public');

            TaskFile::create([
                'task_id' => $task->id,
                'uploaded_by_user_id' => Auth::id(),
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_mime_type' => $file->getMimeType()
            ]);
        }

        return response()->json($task->load('files'), 201);
    }

    public function show($id)
    {
        $task = Task::with('files')->find($id);

        if (!$task) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($task->user_id != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($task->user_id != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->update($request->all());

        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($task->user_id != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}