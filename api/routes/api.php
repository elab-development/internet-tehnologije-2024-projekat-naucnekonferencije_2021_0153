<?php

use App\Http\Controllers\ConferenceController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\ReviewerAssignmentController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\TicketTypeController;
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


Route::get('conferences/{conference}/ticket-types', [TicketTypeController::class, 'index']);
Route::post('conferences/{conference}/ticket-types', [TicketTypeController::class, 'store']);
Route::apiResource('ticket-types', TicketTypeController::class)->only(['show','update','destroy']);


Route::get('conferences/{conference}/registrations', [RegistrationController::class, 'index']);
Route::post('conferences/{conference}/registrations', [RegistrationController::class, 'store']);
Route::apiResource('registrations', RegistrationController::class)->only(['show','update','destroy']);
Route::put('registrations/{registration}/checkin', [RegistrationController::class, 'checkin']);



 
Route::get('submissions', [SubmissionController::class, 'index']);
Route::post('conferences/{conference}/submissions', [SubmissionController::class, 'storeForConference']);
Route::post('issues/{issue}/submissions', [SubmissionController::class, 'storeForIssue']);
Route::apiResource('submissions', SubmissionController::class)->only(['show','update','destroy']);
 


Route::post('submissions/{submission}/authors', [SubmissionController::class, 'addAuthor']);
Route::delete('submissions/{submission}/authors/{user}', [SubmissionController::class, 'removeAuthor']);
Route::put('submissions/{submission}/status', [SubmissionController::class, 'setStatus']);
Route::put('submissions/{submission}/move-to-issue/{issue}', [SubmissionController::class, 'moveToIssue']);


 
Route::get('submissions/{submission}/assignments', [ReviewerAssignmentController::class, 'index']);
Route::post('submissions/{submission}/assignments', [ReviewerAssignmentController::class, 'store']);
Route::put('assignments/{assignment}/accept', [ReviewerAssignmentController::class, 'accept']);
Route::put('assignments/{assignment}/decline', [ReviewerAssignmentController::class, 'decline']);
Route::delete('assignments/{assignment}', [ReviewerAssignmentController::class, 'destroy']);