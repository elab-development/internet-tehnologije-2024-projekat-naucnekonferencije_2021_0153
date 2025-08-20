<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewerAssignment extends Model
{
    use HasFactory;
     protected $fillable = [
        'submission_id', 'reviewer_id',
        'invited_at', 'accepted_at', 'declined_at', 'due_at'
    ];
    protected $casts = [
        'invited_at'=>'datetime', 'accepted_at'=>'datetime',
        'declined_at'=>'datetime', 'due_at'=>'datetime'
    ];
}
