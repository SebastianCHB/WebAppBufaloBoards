<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lista;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ListaController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->board_id) {
            return response()->json(['error' => 'El parámetro board_id es requerido'], 400);
        }

        $board = Board::find($request->board_id);

        if (!$board) {
            return response()->json(['error' => 'Tablero no encontrado'], 404);
        }

        if ($board->user_id != Auth::id()) {
            return response()->json(['error' => 'No autorizado para ver este tablero'], 403);
        }

        $listas = Lista::where('board_id', $request->board_id)->get();

        return response()->json($listas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'board_id' => 'required|exists:boards,id'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $board = Board::find($request->board_id);
        if ($board->user_id != Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $lista = Lista::create([
            'title' => $request->title,
            'board_id' => $request->board_id
        ]);

        return response()->json($lista, 201);
    }

    public function show($id)
    {
        $lista = Lista::find($id);

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        if ($lista->board->user_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($lista);
    }

    public function update(Request $request, $id)
    {
        $lista = Lista::find($id);

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        if ($lista->board->user_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $lista->update($request->only('title'));

        return response()->json($lista);
    }

    public function destroy($id)
    {
        $lista = Lista::find($id);

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        if ($lista->board->user_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $lista->delete();

        return response()->json(['message' => 'Lista eliminada correctamente']);
    }
}