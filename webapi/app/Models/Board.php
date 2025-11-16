<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;
    protected $guarded = []; 

    public function lists() {
        return $this->hasMany(\App\Models\Lista::class);
    }
}