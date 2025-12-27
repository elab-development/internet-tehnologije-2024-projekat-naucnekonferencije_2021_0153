<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Conference;
use App\Models\Issue;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    // GET /submissions
    public function index(Request $request)
    {
        $q = Submission::query()
            ->with([
                'correspondingAuthor',
                'reviewerAssignments.reviewer', // <<< dodato
            ]);

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }
        if ($request->filled('submitable_type') && $request->filled('submitable_id')) {
            $q->where('submitable_type', $request->submitable_type)
            ->where('submitable_id', $request->submitable_id);
        }

        return $q->latest()->paginate($request->get('per_page', 20));
    }

    //obratiti paznju da je ova funkcija protected i da za nju necemo imati rutu zato dodajemo javne metode koje
    //ce pozivati ovu genericku funkciju
    protected function storeGeneric(Request $request, $type, $id)
    {
        $data = $request->validate([
            'title'                   => 'required|string|max:255',
            'abstract'                => 'nullable|string',
            'corresponding_author_id' => 'required|exists:users,id',
            'manuscript_path'         => 'required|string|max:1024',
            'supplementary_files'     => 'nullable|array',
            'camera_ready_path'       => 'nullable|string|max:1024',
            'keywords'                => 'nullable|string',
            // opciono: ako želiš da pošalješ i druge autore
            'author_ids'              => 'nullable|array',
            'author_ids.*'            => 'integer|exists:users,id',
        ]);

        $data['submitable_type'] = $type;
        $data['submitable_id']   = $id;
        $data['status']          = 'submitted';

        $sub = Submission::create($data);

        // 1) UVEK upiši korespondentnog autora u pivot kao autora #1
        $order = 1;
        $sub->authors()->attach($data['corresponding_author_id'], [
            'author_order'     => $order++,
            'is_corresponding' => true,
        ]);

        // 2) Ako su poslati dodatni autori, dodaj ih (bez duplikata)
        if (!empty($data['author_ids']) && is_array($data['author_ids'])) {
            foreach (array_unique($data['author_ids']) as $uid) {
                // preskoči ako je to već korespondentni autor
                if ((int)$uid === (int)$data['corresponding_author_id']) {
                    continue;
                }
                $sub->authors()->attach($uid, [
                    'author_order'     => $order++,
                    'is_corresponding' => false,
                ]);
            }
        }

        return response()->json($sub->load('authors'), 201);
    }


    public function storeForConference(Request $request, Conference $conference) {
        return $this->storeGeneric($request, Conference::class, $conference->id);
        }

    // GET /submissions/{submission}
    public function show(Submission $submission)
    {
        return $submission->load([
            'authors',
            'correspondingAuthor',
            'reviews.reviewer',
            'reviewerAssignments.reviewer', // <<< isto i ovde
        ]);
    }

    // PUT/PATCH /submissions/{submission}
    public function update(Request $request, Submission $submission)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'abstract' => 'nullable|string',
            'status' => 'in:submitted,in_review,revision_required,accepted,rejected,camera_ready,published',
            'manuscript_path' => 'nullable|string|max:1024',
            'supplementary_files' => 'nullable|array',
            'camera_ready_path' => 'nullable|string|max:1024',
            'keywords' => 'nullable|string',
            'doi' => 'nullable|string|max:255',
            'pages' => 'nullable|string|max:50',
            'published_at' => 'nullable|date',
        ]);
        $submission->update($data);
        return $submission->fresh();
    }

    // DELETE /submissions/{submission}
    public function destroy(Submission $submission)
    {
        $submission->delete();
        return response()->noContent();
    }

    // POST /submissions/{submission}/authors
    public function addAuthor(Request $request, Submission $submission)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'author_order' => 'nullable|integer|min:1',
            'is_corresponding' => 'nullable|boolean',
        ]);
        $submission->authors()->attach($data['user_id'], [
            'author_order' => $data['author_order'] ?? ($submission->authors()->count()+1),
            'is_corresponding' => $data['is_corresponding'] ?? false,
        ]);
        return $submission->load('authors');
    }

    // DELETE /submissions/{submission}/authors/{user}
    public function removeAuthor(Submission $submission, $userId)
    {
        $submission->authors()->detach($userId);
        return $submission->load('authors');
    }

    // PUT /submissions/{submission}/status
    public function setStatus(Request $request, Submission $submission)
    {
        $data = $request->validate([
            'status' => 'required|in:submitted,in_review,revision_required,accepted,rejected,camera_ready,published'
        ]);
        $submission->update(['status' => $data['status']]);
        return $submission;
    }

 
}
