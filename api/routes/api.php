<?php

use App\Http\Controllers\ConferenceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::apiResource('conferences', ConferenceController::class);
Route::get('conferences/{conference}/program', [ConferenceController::class, 'program']);
Route::put('conferences/{conference}/program', [ConferenceController::class, 'updateProgram']);
Route::put('conferences/{conference}/publish', [ConferenceController::class, 'publish']);
Route::put('conferences/{conference}/close',   [ConferenceController::class, 'close']);