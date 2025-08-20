<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conference extends Model
{
    use HasFactory;
    protected $fillable = [
        'title', 'acronym', 'location',
        'start_date', 'end_date',
        'status',           // draft|published|closed
        'description',      // nullable
        'max_capacity',     // nullable
        'program_json'      // JSON: [{day, start, end, room, title, speaker, type}]
    ];
    protected $casts = ['program_json' => 'array', 'start_date'=>'date', 'end_date'=>'date'];
}
