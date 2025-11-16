<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BoardController extends Controller
{
    /**
     * Asegurarnos de que el usuario esté autenticado
     * para todas las operaciones de tableros.
     */
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * 1. LEER (Todos)
     */
    public function index()
    {
        $userId = Auth::id(); 
        
        $boards = Board::where('user_id', $userId)->get();

        return response()->json($boards);
    }

    /**
     * 2. CREAR
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $board = Board::create([
            'name' => $request->name,
            'user_id' => Auth::id()
        ]);

        return response()->json($board, 201);
    }

    /**
     * 3. LEER
     */
    public function show($id)
    {
        $board = Board::find($id);

        if (!$board) {
            return response()->json(['message' => 'Tablero no encontrado'], 404);
        }
        // --- Verificación de Seguridad ---
        if ($board->user_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403); // 403: Forbidden
        }

        return response()->json($board);
    }

    /**
     * 4. ACTUALIZAR
     */
    public function update(Request $request, $id)
    {
        $board = Board::find($id);

        if (!$board) {
            return response()->json(['message' => 'Tablero no encontrado'], 404);
        }

        if ($board->user_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $board->name = $request->name;
        $board->save();

        return response()->json($board);
    }
// tumbar 
    public function destroy($id)
    {
        $board = Board::find($id);

        if (!$board) {
            return response()->json(['message' => 'Tablero no encontrado'], 404);
        }
        if ($board->user_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $board->delete();

        return response()->json(['message' => 'Tablero eliminado'], 200);
    }
}