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
    // GET /reviewer/assignments  - vraca sve zadatke za ulogovanog recenzenta
       public function myAssignments(Request $request)
    {
        $uid = $request->user()->id;

        // sve dodele za ovog reviewera + submission sa autorom i njegovom (ovog reviewera) recenzijom
        return ReviewerAssignment::query()
            ->where('reviewer_id', $uid)
            ->with([
                'submission' => function ($q) use ($uid) {
                    $q->select('id','title','status','manuscript_path','corresponding_author_id')
                      ->with([
                          'correspondingAuthor:id,name',
                          // vrati samo recenziju ovog reviewera (ako je već postoji)
                          'reviews' => function ($r) use ($uid) {
                              $r->where('reviewer_id', $uid)
                                ->select('id','submission_id','reviewer_id','recommendation','score_overall','comments_to_authors','comments_to_editors','submitted_at');
                          },
                      ]);
                }
            ])
            ->latest()
            ->get();
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
