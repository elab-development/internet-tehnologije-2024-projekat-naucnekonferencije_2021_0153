<?php

namespace App\Http\Controllers;

use App\Models\TicketType;
use App\Models\Conference;
use Illuminate\Http\Request;

class TicketTypeController extends Controller
{
    // GET /conferences/{conference}/ticket-types
    public function index(Conference $conference)
    {
        return $conference->ticketTypes()->orderBy('price')->get();
    }

    // POST /conferences/{conference}/ticket-types
    public function store(Request $request, Conference $conference)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'sales_start' => 'nullable|date',
            'sales_end' => 'nullable|date|after_or_equal:sales_start',
            'quota' => 'nullable|integer|min:0',
        ]);
        $data['conference_id'] = $conference->id;

        return TicketType::create($data);
    }

    // GET /ticket-types/{ticketType}
    public function show(TicketType $ticketType)
    {
        return $ticketType;
    }

    // PUT/PATCH /ticket-types/{ticketType}
    public function update(Request $request, TicketType $ticketType)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'price' => 'sometimes|required|numeric|min:0',
            'currency' => 'sometimes|required|string|size:3',
            'sales_start' => 'nullable|date',
            'sales_end' => 'nullable|date|after_or_equal:sales_start',
            'quota' => 'nullable|integer|min:0',
        ]);
        $ticketType->update($data);
        return $ticketType->fresh();
    }

    // DELETE /ticket-types/{ticketType}
    public function destroy(TicketType $ticketType)
    {
        $ticketType->delete();
        return response()->noContent();
    }
}
