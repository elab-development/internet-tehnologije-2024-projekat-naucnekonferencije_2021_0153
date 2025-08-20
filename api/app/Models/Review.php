<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;
     protected $fillable = [
        'submission_id', 'reviewer_id',
        'recommendation',   // accept|minor|major|reject
        'score_overall',    // 0–100
        'comments_to_authors',
        'comments_to_editors',
        'submitted_at',
        'attachment_paths'  // JSON niz putanja (nullable)
    ];
    protected $casts = ['submitted_at'=>'datetime', 'attachment_paths'=>'array'];
}
