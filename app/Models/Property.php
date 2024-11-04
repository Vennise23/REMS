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
        'property_title',
        'property_type',
        'property_address_line_1',
        'property_address_line_2',
        'property_city',
        'property_postal_code',
        'number_of_units',
        'total_commercial_units',
        'total_commercial_space_sqft',
        'year_built',
        'developer',
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
