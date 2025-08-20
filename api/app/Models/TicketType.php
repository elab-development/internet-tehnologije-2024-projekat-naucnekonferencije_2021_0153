<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketType extends Model
{
    use HasFactory;
      protected $fillable = [
        'conference_id',
        'name', 'price', 'currency',
        'sales_start', 'sales_end',
        'quota' // nullable
    ];
    protected $casts = ['sales_start'=>'date', 'sales_end'=>'date'];

       public function conference()
    {
        return $this->belongsTo(Conference::class);
    }

    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}
