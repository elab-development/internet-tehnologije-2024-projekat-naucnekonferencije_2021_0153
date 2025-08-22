<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index()
    {
        return Journal::orderBy('title')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'issn_print' => 'nullable|string|max:20',
            'issn_online' => 'nullable|string|max:20',
            'publisher' => 'nullable|string|max:255',
            'aims_scope' => 'nullable|string',
        ]);
        return Journal::create($data);
    }

    public function show(Journal $journal)
    {
        return $journal->loadCount('issues');
    }

    public function update(Request $request, Journal $journal)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'issn_print' => 'nullable|string|max:20',
            'issn_online' => 'nullable|string|max:20',
            'publisher' => 'nullable|string|max:255',
            'aims_scope' => 'nullable|string',
        ]);
        $journal->update($data);
        return $journal->fresh();
    }

    public function destroy(Journal $journal)
    {
        $journal->delete();
        return response()->noContent();
    }
}
