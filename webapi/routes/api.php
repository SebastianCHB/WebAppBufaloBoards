<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ListaController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskFileController;
use App\Http\Controllers\UserController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::group(['middleware' => 'auth:api'], function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::apiResource('boards', BoardController::class);
    Route::post('/boards/{id}/invite', [BoardController::class, 'addMember']);
    Route::post('/boards/{id}/leave', [BoardController::class, 'leave']);

    Route::apiResource('lists', ListaController::class);

    Route::apiResource('tasks', TaskController::class);
    Route::put('/tasks/{id}/move', [TaskController::class, 'move']);

    Route::get('/files/{id}/download', [TaskFileController::class, 'download']);
    Route::post('/files', [TaskFileController::class, 'store']);
    Route::delete('/files/{id}', [TaskFileController::class, 'destroy']);
});