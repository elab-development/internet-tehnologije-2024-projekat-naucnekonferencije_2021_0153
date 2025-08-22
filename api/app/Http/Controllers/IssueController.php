<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Journal;
use Illuminate\Http\Request;

class IssueController extends Controller
{
    // GET /journals/{journal}/issues
    public function index(Journal $journal)
    {
        return $journal->issues()->latest()->get();
    }

    // POST /journals/{journal}/issues
    public function store(Request $request, Journal $journal)
    {
        $data = $request->validate([
            'volume' => 'nullable|string|max:50',
            'number' => 'nullable|string|max:50',
            'year' => 'nullable|string|max:10',
            'special_issue_title' => 'nullable|string|max:255',
            'status' => 'in:open,in_review,published',
        ]);
        $data['journal_id'] = $journal->id;

        return Issue::create($data);
    }

    // GET /issues/{issue}
    public function show(Issue $issue)
    {
        return $issue->loadCount('submissions');
    }

    // PUT/PATCH /issues/{issue}
    public function update(Request $request, Issue $issue)
    {
        $data = $request->validate([
            'volume' => 'nullable|string|max:50',
            'number' => 'nullable|string|max:50',
            'year' => 'nullable|string|max:10',
            'special_issue_title' => 'nullable|string|max:255',
            'status' => 'in:open,in_review,published',
        ]);
        $issue->update($data);
        return $issue->fresh();
    }

    // DELETE /issues/{issue}
    public function destroy(Issue $issue)
    {
        $issue->delete();
        return response()->noContent();
    }
}
