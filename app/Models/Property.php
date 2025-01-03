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

    // 添加默认值属性
    protected $attributes = [
        'property_name' => 'Untitled Property',
        'property_type' => 'Conventional Condominium',
        'property_address_line_1' => 'Address not provided',
        'property_address_line_2' => '',
        'city' => 'Not specified',
        'postal_code' => '00000',
        'purchase' => 'For Sale',
        'sale_type' => 'Subsale',
        'number_of_units' => 1,
        'square_feet' => 0,
        'price' => 0,
        'parking' => 'Above ground',
        'each_unit_has_furnace' => false,
        'each_unit_has_electrical_meter' => false,
        'has_onsite_caretaker' => false,
        'additional_info' => '',
        'username' => 'Anonymous',
    ];
}
