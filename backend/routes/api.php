<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/register', fn () => response()->json([
    'message' => 'Method not allowed. Use POST /api/register.',
], 405));

Route::get('/login', fn () => response()->json([
    'message' => 'Method not allowed. Use POST /api/login.',
], 405));

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
