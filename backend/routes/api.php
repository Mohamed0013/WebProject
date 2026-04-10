<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PerfumeController;

Route::get('/register', fn () => response()->json([
    'message' => 'Method not allowed. Use POST /api/register.',
], 405));

Route::get('/login', fn () => response()->json([
    'message' => 'Method not allowed. Use POST /api/login.',
], 405));

Route::get('/perfumes', [PerfumeController::class, 'index']);
Route::get('/perfumes/{slug}', [PerfumeController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::patch('/admin/orders/{order}/validate', [OrderController::class, 'markAsValidated']);
});
