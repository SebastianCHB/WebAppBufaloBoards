<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ListaController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\AdminUserController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

//protegidas
Route::group(['middleware' => 'auth:api'], function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::apiResource('boards', BoardController::class);
    Route::apiResource('lists', ListaController::class);
    Route::apiResource('tasks', TaskController::class);

    Route::group(['middleware' => 'is_admin'], function () {
        Route::apiResource('admin/users', AdminUserController::class);
    });
});