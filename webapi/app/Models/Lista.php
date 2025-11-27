<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lista extends Model
{
    use HasFactory;

    protected $table = 'listas';
    protected $fillable = ['board_id', 'title', 'position', 'type'];

    public function tasks()
    {
        return $this->hasMany(Task::class, 'list_id')->orderBy('position', 'asc');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }
}