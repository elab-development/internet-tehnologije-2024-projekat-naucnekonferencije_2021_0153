<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /submissions/{submission}/reviews
    public function index(Submission $submission)
    {
        return $submission->reviews()->with('reviewer')->get();
    }

    // POST /submissions/{submission}/reviews
    public function store(Request $request, Submission $submission)
    {
        $data = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'recommendation' => 'nullable|in:accept,minor,major,reject',
            'score_overall' => 'nullable|integer|min:0|max:100',
            'comments_to_authors' => 'nullable|string',
            'comments_to_editors' => 'nullable|string',
            'attachment_paths' => 'nullable|array',
        ]);

        $data['submission_id'] = $submission->id;
        $data['submitted_at'] = now();

        return Review::create($data);
    }

    // GET /reviews/{review}
    public function show(Review $review)
    {
        return $review->load(['submission','reviewer']);
    }

    // PUT/PATCH /reviews/{review}
    public function update(Request $request, Review $review)
    {
        $data = $request->validate([
            'recommendation' => 'nullable|in:accept,minor,major,reject',
            'score_overall' => 'nullable|integer|min:0|max:100',
            'comments_to_authors' => 'nullable|string',
            'comments_to_editors' => 'nullable|string',
            'attachment_paths' => 'nullable|array',
        ]);
        $review->update($data);
        return $review->fresh();
    }

    // DELETE /reviews/{review}
    public function destroy(Review $review)
    {
        $review->delete();
        return response()->noContent();
    }
}
