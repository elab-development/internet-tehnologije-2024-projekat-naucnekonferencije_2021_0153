<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    use HasFactory;
    protected $fillable = [
        'title', 'issn_print', 'issn_online',
        'publisher', 'aims_scope'
    ];
      public function issues()
    {
        return $this->hasMany(Issue::class);
    }
}
