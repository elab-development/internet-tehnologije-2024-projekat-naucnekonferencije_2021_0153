
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    ConferenceController,
    TicketTypeController,
    RegistrationController,
    SubmissionController,
    ReviewerAssignmentController,
    ReviewController,
    
};

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

// Jedna full resource ruta (ispunjava uslov)
Route::apiResource('conferences', ConferenceController::class)
    ->only(['index','show']); // javno dostupne metode

// Public dodatne rute
Route::get('conferences/{conference}/program', [ConferenceController::class, 'program']);
Route::get('conferences/{conference}/ticket-types', [TicketTypeController::class, 'index']);
Route::get('ticket-types/{ticketType}', [TicketTypeController::class, 'show']);
 

// Auth
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login',    [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Protected routes (auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);
    Route::put('auth/password', [AuthController::class, 'updatePassword']);
     Route::get('users', [AuthController::class, 'allUsers']);

    // Conferences (sve ostale metode)
    Route::post('conferences', [ConferenceController::class, 'store']);
    Route::put('conferences/{conference}', [ConferenceController::class, 'update']);
    Route::delete('conferences/{conference}', [ConferenceController::class, 'destroy']);
    Route::put('conferences/{conference}/publish', [ConferenceController::class, 'publish']);
    Route::put('conferences/{conference}/close', [ConferenceController::class, 'close']);
    Route::put('conferences/{conference}/program', [ConferenceController::class, 'updateProgram']);

    // Ticket types (manage)
    Route::post('conferences/{conference}/ticket-types', [TicketTypeController::class, 'store']);
    Route::put('ticket-types/{ticketType}', [TicketTypeController::class, 'update']);
    Route::delete('ticket-types/{ticketType}', [TicketTypeController::class, 'destroy']);

    // Registrations
    Route::get('conferences/{conference}/registrations', [RegistrationController::class, 'index']);
    Route::post('conferences/{conference}/registrations', [RegistrationController::class, 'store']);
    Route::get('registrations/{registration}', [RegistrationController::class, 'show']);
    Route::put('registrations/{registration}', [RegistrationController::class, 'update']);
    Route::delete('registrations/{registration}', [RegistrationController::class, 'destroy']);
    Route::put('registrations/{registration}/checkin', [RegistrationController::class, 'checkin']);

    // Submissions
    Route::get('submissions', [SubmissionController::class, 'index']);
    Route::post('conferences/{conference}/submissions', [SubmissionController::class, 'storeForConference']);
    Route::post('issues/{issue}/submissions', [SubmissionController::class, 'storeForIssue']);
    Route::get('submissions/{submission}', [SubmissionController::class, 'show']);
    Route::put('submissions/{submission}', [SubmissionController::class, 'update']);
    Route::delete('submissions/{submission}', [SubmissionController::class, 'destroy']);

    Route::post('submissions/{submission}/authors', [SubmissionController::class, 'addAuthor']);
    Route::delete('submissions/{submission}/authors/{user}', [SubmissionController::class, 'removeAuthor']);
    Route::put('submissions/{submission}/status', [SubmissionController::class, 'setStatus']);
    Route::put('submissions/{submission}/move-to-issue/{issue}', [SubmissionController::class, 'moveToIssue']);

    // Reviewer assignments
    Route::get('submissions/{submission}/assignments', [ReviewerAssignmentController::class, 'index']);
    Route::post('submissions/{submission}/assignments', [ReviewerAssignmentController::class, 'store']);
    Route::put('assignments/{assignment}/accept', [ReviewerAssignmentController::class, 'accept']);
    Route::put('assignments/{assignment}/decline', [ReviewerAssignmentController::class, 'decline']);
    Route::delete('assignments/{assignment}', [ReviewerAssignmentController::class, 'destroy']);
    Route::get('reviewer/assignments', [ReviewerAssignmentController::class, 'myAssignments']);

    // Reviews
    Route::get('submissions/{submission}/reviews', [ReviewController::class, 'index']);
    Route::post('submissions/{submission}/reviews', [ReviewController::class, 'store']);
    Route::get('reviews/{review}', [ReviewController::class, 'show']);
    Route::put('reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);

 
});
