<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\Conference;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    // GET /conferences/{conference}/registrations
    public function index(Conference $conference, Request $request)
    {
        $q = $conference->registrations()->with(['user','ticketType']);
        if ($request->filled('status')) $q->where('status', $request->status);
        return $q->latest()->paginate($request->get('per_page', 20));
    }

    // POST /conferences/{conference}/registrations
    public function store(Request $request, Conference $conference)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'ticket_type_id' => 'nullable|exists:ticket_types,id',
            'status' => 'in:pending,confirmed,cancelled',
        ]);
        $data['conference_id'] = $conference->id;

        return Registration::create($data);
    }

    // GET /registrations/{registration}
    public function show(Registration $registration)
    {
        return $registration->load(['user','conference','ticketType']);
    }

    // PUT/PATCH /registrations/{registration}
    public function update(Request $request, Registration $registration)
    {
        $data = $request->validate([
            'ticket_type_id' => 'nullable|exists:ticket_types,id',
            'status' => 'in:pending,confirmed,cancelled',
            'paid_at' => 'nullable|date',
        ]);
        $registration->update($data);
        return $registration->fresh();
    }

    // DELETE /registrations/{registration}
    public function destroy(Registration $registration)
    {
        $registration->delete();
        return response()->noContent();
    }

    // PUT /registrations/{registration}/checkin
    public function checkin(Registration $registration)
    {
        $registration->update(['checkin_at' => now()]);
        return $registration;
    }
}
