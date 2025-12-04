<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Lista;
use App\Models\User;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(Board::with('user')->latest()->get());
        }

        $boards = Board::with('user')
            ->where('user_id', $user->id)
            ->orWhereHas('members', function($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->latest()
            ->get();

        return response()->json($boards);
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
        }, 'lists.tasks.user', 'lists.tasks.files', 'members'])->findOrFail($id);

        return response()->json($board);
    }

    public function update(Request $request, $id)
    {
        $board = Board::findOrFail($id);
        
        if ($board->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Solo el dueño puede editar el tablero'], 403);
        }

        $request->validate(['name' => 'required|string|max:255']);
        
        $board->update(['name' => $request->name]);

        return response()->json($board);
    }

    public function addMember(Request $request, $id)
    {
        $board = Board::findOrFail($id);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'El correo no está registrado en el sistema.'], 404);
        }

        if ($board->user_id === $user->id) {
            return response()->json(['message' => 'El dueño ya es miembro del tablero.'], 409);
        }

        if ($board->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Este usuario ya es miembro del tablero.'], 409);
        }

        $board->members()->attach($user->id);

        return response()->json($board->load('members'));
    }

    public function leave(Request $request, $id)
    {
        $board = Board::findOrFail($id);
        $user = $request->user();

        if ($board->user_id === $user->id) {
            return response()->json(['message' => 'El dueño no puede abandonar el tablero, debe eliminarlo.'], 400);
        }

        $board->members()->detach($user->id);

        return response()->json(['message' => 'Has abandonado el tablero.']);
    }

    public function destroy($id)
    {
        Board::destroy($id);
        return response()->json(null, 204);
    }
}