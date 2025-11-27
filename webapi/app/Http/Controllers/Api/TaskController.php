<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        return response()->json(Task::with(['list', 'user'])->latest()->get());
    }

    public function move(Request $request, $id)
{
    $task = Task::findOrFail($id);
    
    $task->list_id = $request->list_id;
    $task->position = $request->position;
    $task->save();
    
    return response()->json($task);
}

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'list_id' => 'required|exists:listas,id'
        ]);

        $task = Task::create($request->all());
        return response()->json($task, 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->all());
        return response()->json($task);
    }

    public function destroy($id)
    {
        Task::destroy($id);
        return response()->json(null, 204);
    }
}