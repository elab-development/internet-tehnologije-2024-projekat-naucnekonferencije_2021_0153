<?php

namespace App\Http\Controllers;

use App\Models\Conference;
use Illuminate\Http\Request;

class ConferenceController extends Controller
{
    // GET /conferences
    public function index(Request $request)
    {
        $q = Conference::query();

        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('from'))   $q->whereDate('start_date', '>=', $request->from);
        if ($request->filled('to'))     $q->whereDate('end_date', '<=', $request->to);

        return $q->orderBy('start_date')->paginate($request->get('per_page', 15));
    }

    // POST /conferences
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'acronym' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'in:draft,published,closed',
            'description' => 'nullable|string',
            'max_capacity' => 'nullable|integer|min:0',
            'program_json' => 'nullable|array',
        ]);

        $conf = Conference::create($data);
        return response()->json($conf, 201);
    }

    // GET /conferences/{id}
    public function show(Conference $conference)
    {
        // eager load related counts
        $conference->loadCount(['ticketTypes', 'registrations', 'submissions']);
        return $conference;
    }

    // PUT/PATCH /conferences/{id}
    public function update(Request $request, Conference $conference)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'acronym' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'in:draft,published,closed',
            'description' => 'nullable|string',
            'max_capacity' => 'nullable|integer|min:0',
            'program_json' => 'nullable|array',
        ]);

        $conference->update($data);
        return $conference->fresh();
    }

    // DELETE /conferences/{id}
    public function destroy(Conference $conference)
    {
        $conference->delete();
        return response()->noContent();
    }

    // PUT /conferences/{id}/publish
    public function publish(Conference $conference)
    {
        $conference->update(['status' => 'published']);
        return $conference;
    }

    // PUT /conferences/{id}/close
    public function close(Conference $conference)
    {
        $conference->update(['status' => 'closed']);
        return $conference;
    }

    // GET /conferences/{id}/program
    public function program(Conference $conference)
    {
        return ['program' => $conference->program_json ?? []];
    }

    // PUT /conferences/{id}/program
    public function updateProgram(Request $request, Conference $conference)
    {
        $data = $request->validate(['program' => 'required|array']);
        $conference->update(['program_json' => $data['program']]);
        return ['program' => $conference->program_json];
    }
}
