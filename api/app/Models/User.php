<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name','email','password',
        'role',         // admin|organizer|editor|reviewer|author|attendee
        'affiliation',  // nullable
        'orcid'         // opcionalno
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

  // Prijave na konferencije (kupovina karata)
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    // Radovi gde je korisnik autor (pivot: submission_user)
    public function authoredSubmissions()
    {
        return $this->belongsToMany(Submission::class, 'submission_user')
            ->withPivot(['author_order','is_corresponding'])
            ->withTimestamps()
            ->orderBy('pivot_author_order');
    }

    // Radovi gde je korisnik korespondentni autor
    public function correspondingSubmissions()
    {
        return $this->hasMany(Submission::class, 'corresponding_author_id');
    }

    // Dodele za recenziju (kao recenzent)
    public function reviewerAssignments()
    {
        return $this->hasMany(ReviewerAssignment::class, 'reviewer_id');
    }

    // Recenzije koje je korisnik predao
    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }
}
