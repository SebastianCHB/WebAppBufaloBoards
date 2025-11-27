<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Lista;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index()
    {
        return response()->json(Board::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'user_id' => 'required|exists:users,id'
        ]);

        $board = Board::create([
            'name' => $request->name,
            'user_id' => $request->user_id
        ]);

        $estados = ['PENDIENTE', 'EN TRABAJO', 'EN REVISION', 'TERMINADO'];
        
        foreach ($estados as $index => $titulo) {
            Lista::create([
                'board_id' => $board->id,
                'title' => $titulo,
                'position' => $index + 1
            ]);
        }

        return response()->json($board, 201);
    }

    public function show($id)
{
    $board = Board::with(['lists' => function($query) {
        $query->orderBy('position', 'asc');
    }, 'lists.tasks' => function($query) {
        $query->orderBy('position', 'asc');
    }])->findOrFail($id);

    return response()->json($board);
}

    public function destroy($id)
    {
        Board::destroy($id);
        return response()->json(null, 204);
    }
}