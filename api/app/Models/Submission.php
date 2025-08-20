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
}
