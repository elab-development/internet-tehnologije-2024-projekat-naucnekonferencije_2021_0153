<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    use HasFactory;
     protected $fillable = [
        'conference_id', 'user_id', 'ticket_type_id',
        'status',         // pending|confirmed|cancelled
        'paid_at',        // nullable
        'checkin_at'      // nullable
    ];
    protected $casts = ['paid_at'=>'datetime', 'checkin_at'=>'datetime'];
}
