<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'relation_to_property',
        'address_line_1',
        'address_line_2',
        'city',
        'phone1',
        'phone2',
        'fax',
        'email',
        'heard_about_us',
        'property_name',
        'property_address_line_1',
        'property_address_line_2',
        'property_city',
        'postal_code',
        'number_of_units',
        'total_commercial_units',
        'total_commercial_space_sqft',
        'year_built',
        'developer',
        'condominium_plan_number',
        'property_type',
        'property_styles',
        'each_unit_has_furnace',
        'each_unit_has_electrical_meter',
        'has_onsite_caretaker',
        'parking',
        'amenities',
        'other_amenities',
        'additional_info',
        'image_path'
    ];

    protected $casts = [
        'property_styles' => 'array',
        'amenities' => 'array',
        'each_unit_has_furnace' => 'boolean',
        'each_unit_has_electrical_meter' => 'boolean',
        'has_onsite_caretaker' => 'boolean',
        'management_commence_date' => 'date',
    ];
}
