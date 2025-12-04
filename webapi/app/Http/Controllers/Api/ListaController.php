<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lista;
use Illuminate\Http\Request;

class ListaController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->has('board_id')) {
            return response()->json(Lista::with('board')->get());
        }

        return response()->json(
            Lista::where('board_id', $request->board_id)
                 ->orderBy('position', 'asc')
                 ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'board_id' => 'required|exists:boards,id'
        ]);

        $lista = Lista::create([
            'title' => $request->title,
            'board_id' => $request->board_id,
            'position' => 0 
        ]);

        return response()->json($lista, 201);
    }

    public function show($id)
    {
        $lista = Lista::with('board')->find($id);

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        return response()->json($lista);
    }

    public function update(Request $request, $id)
    {
        $lista = Lista::find($id);

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        $lista->update($request->all());

        return response()->json($lista);
    }

    public function destroy($id)
    {
        $lista = Lista::find($id);

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        $lista->delete();

        return response()->json(null, 204);
    }
}