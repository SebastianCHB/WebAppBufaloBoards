<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lista extends Model
{
    use HasFactory;
    protected $guarded = []; 

    public function board() {
        return $this->belongsTo(Board::class);
    }

    public function cards() {
        return $this->hasMany(Card::class);
    }
}