<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'username',
        'property_name',
        'property_type',
        'property_address_line_1',
        'property_address_line_2',
        'city', 
        'postal_code', 
        'purchase', 
        'sale_type', 
        'number_of_units',
        'square_feet',
        'price', 
        'certificate_number',
        'certificate_photos',
        'property_photos',
        'each_unit_has_furnace',
        'each_unit_has_electrical_meter',
        'has_onsite_caretaker',
        'parking',
        'amenities',
        'other_amenities',
        'additional_info',
    ];

    protected $casts = [
        'certificate_photos' => 'array',
        'property_photos' => 'array',
        'amenities' => 'array',
        'each_unit_has_furnace' => 'boolean',
        'each_unit_has_electrical_meter' => 'boolean',
        'has_onsite_caretaker' => 'boolean',
    ];
}
