<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'state',
        'purchase',
        'sale_type',
        'number_of_units',
        'square_feet',
        'price',
        'certificate_photos',
        'property_photos',
        'each_unit_has_furnace',
        'each_unit_has_electrical_meter',
        'has_onsite_caretaker',
        'parking',
        'amenities',
        'other_amenities',
        'additional_info',
        'status',
        'buyer_id',
        'transaction_date',
        'approval_status',
        'is_read',
    ];

    protected $casts = [
        'certificate_photos' => 'array',
        'property_photos' => 'array',
        'amenities' => 'array',
        'each_unit_has_furnace' => 'boolean',
        'each_unit_has_electrical_meter' => 'boolean',
        'has_onsite_caretaker' => 'boolean',
        'transaction_date' => 'datetime'
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
        'status' => 'available'
    ];

    protected $with = ['user']; 

    // 与卖家（所有者）的关联
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // 与买家的关联
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function getFullAddress()
    {
        $address = $this->property_address_line_1;
        if (!empty($this->property_address_line_2)) {
            $address .= ', ' . $this->property_address_line_2;
        }
        $address .= ', ' . $this->city;
        $address .= ', ' . $this->postal_code;
        $address .= ', Malaysia';
        return $address;
    }
}
