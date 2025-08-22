<?php

namespace App\Http\Controllers;

use App\Models\ReviewerAssignment;
use App\Models\Submission;
use Illuminate\Http\Request;

class ReviewerAssignmentController extends Controller
{
    // GET /submissions/{submission}/assignments
    public function index(Submission $submission)
    {
        return $submission->reviewerAssignments()->with('reviewer')->get();
    }

    // POST /submissions/{submission}/assignments
    public function store(Request $request, Submission $submission)
    {
        $data = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'due_at' => 'nullable|date',
        ]);
        $data['submission_id'] = $submission->id;
        $data['invited_at'] = now();

        return ReviewerAssignment::create($data);
    }

    // PUT /assignments/{assignment}/accept
    public function accept(ReviewerAssignment $assignment)
    {
        $assignment->update(['accepted_at' => now(), 'declined_at' => null]);
        return $assignment;
    }

    // PUT /assignments/{assignment}/decline
    public function decline(ReviewerAssignment $assignment)
    {
        $assignment->update(['declined_at' => now(), 'accepted_at' => null]);
        return $assignment;
    }

    // DELETE /assignments/{assignment}
    public function destroy(ReviewerAssignment $assignment)
    {
        $assignment->delete();
        return response()->noContent();
    }
}
