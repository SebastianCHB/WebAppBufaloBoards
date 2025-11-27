<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ListaController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\AdminUserController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

//protegidas
Route::group(['middleware' => 'auth:api'], function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/users', [UserController::class, 'index']);
    Route::apiResource('boards', BoardController::class);
    Route::apiResource('lists', ListaController::class);
    Route::apiResource('tasks', TaskController::class);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::apiResource('boards', \App\Http\Controllers\Api\BoardController::class);
    Route::apiResource('tasks', \App\Http\Controllers\Api\TaskController::class);
    Route::put('/tasks/{id}/move', [App\Http\Controllers\Api\TaskController::class, 'move']);
    Route::group(['middleware' => 'is_admin'], function () {
        Route::apiResource('admin/users', AdminUserController::class);
    });
});