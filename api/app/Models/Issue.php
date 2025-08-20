<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    use HasFactory;
     protected $fillable = [
        'journal_id',
        'volume', 'number', 'year',
        'special_issue_title', // nullable
        'status'               // open|in_review|published
    ];
     public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function submissions()
    {
        return $this->morphMany(Submission::class, 'submitable');
    }
}
