<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // POST /auth/register
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:8'],
            // role je opcionalan; default attendee. Ne dozvoljavati klijentu promenu u admin/organizer bez policy-ja!
            'role'        => ['nullable', Rule::in(['admin','organizer','editor','reviewer','author','attendee'])],
            'affiliation' => ['nullable','string','max:255'],
            'orcid'       => ['nullable','string','max:255'],
        ]);

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'role'        => $data['role'] ?? 'attendee',
            'affiliation' => $data['affiliation'] ?? null,
            'orcid'       => $data['orcid'] ?? null,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    // POST /auth/login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }


        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // POST /auth/logout
    public function logout(Request $request)
    {
        // obriši SAMO trenutni token
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // GET /auth/me
    public function me(Request $request)  //metoda dopunjena prilikom izrade react domaceg tako da vraca sve moguce podatke o korisniku i sve sto je on ikada radio na platformi
    {
                $user = $request->user()->load([
                // kupovine/registracije
                'registrations.conference:id,title,acronym,start_date,end_date,location',
                'registrations.ticketType:id,conference_id,name,price,currency',
                // submissions (kao autor preko pivot tabele)
                'authoredSubmissions' => function($q){
                    $q->select('submissions.id','title','status','submitable_type','submitable_id')
                    ->withPivot(['author_order','is_corresponding'])
                    ->with([
                        'submitable' // Conference ili Issue
                    ]);
                },
                // submissions gde je korespondentni autor
                'correspondingSubmissions' => function($q){
                    $q->select('id','title','status','submitable_type','submitable_id')
                    ->with('submitable');
                },
                // assignments (recenzent)
                'reviewerAssignments' => function($q){
                    $q->select('id','submission_id','reviewer_id','invited_at','accepted_at','declined_at','due_at')
                    ->with(['submission:id,title,status,submitable_type,submitable_id']);
                },
                // reviews koje je predao
                'reviews' => function($q){
                    $q->select('id','submission_id','reviewer_id','recommendation','score_overall','submitted_at')
                    ->with(['submission:id,title,status,submitable_type,submitable_id']);
                },
            ]);

            // brze metrike za kartice na frontu
            $stats = [
                'registrations_count'         => $user->registrations->count(),
                'authored_submissions_count'  => $user->authoredSubmissions->count(),
                'corresponding_count'         => $user->correspondingSubmissions->count(),
                'assignments_count'           => $user->reviewerAssignments->count(),
                'reviews_count'               => $user->reviews->count(),
            ];

            return response()->json([
                'user'  => $user,
                'stats' => $stats,
            ]);
    }

    // PUT /auth/password
    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required','string'],
            'new_password'     => ['required','string','min:8','different:current_password'],
        ]);

        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($data['new_password'])]);


        return response()->json(['message' => 'Password updated']);
    }

    // POST /auth/logout-all (opciono)
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'All sessions revoked']);
    }
}
