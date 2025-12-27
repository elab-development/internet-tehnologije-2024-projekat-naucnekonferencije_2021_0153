<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;
     protected $fillable = [
        'submitable_type', 'submitable_id', // Conference ili Issue
        'title', 'abstract',
        'status',                 // submitted|in_review|revision_required|accepted|rejected|camera_ready|published
        'corresponding_author_id',
        'manuscript_path',
        'supplementary_files',    // JSON niz putanja
        'camera_ready_path',      // nullable
        // opcionalno za časopisnu objavu:
        'doi', 'pages', 'published_at',
        // ako ne praviš posebnu tabelu za keywords:
        'keywords'                // TEXT/CSV/string (opciono)
    ];
    protected $casts = [
        'supplementary_files' => 'array',
        'published_at' => 'datetime',
    ];

    // Target može biti Conference ili Issue
    public function submitable()
    {
        return $this->morphTo();
    }

    public function correspondingAuthor()
    {
        return $this->belongsTo(User::class, 'corresponding_author_id');
    }

    public function authors()
    {
        return $this->belongsToMany(User::class, 'submission_user')
            ->withPivot(['author_order','is_corresponding'])
            ->withTimestamps()
            ->orderBy('pivot_author_order');
    }

    public function reviewerAssignments()
    {
        return $this->hasMany(ReviewerAssignment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
