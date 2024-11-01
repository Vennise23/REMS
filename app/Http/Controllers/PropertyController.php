<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    // public function create()
    // {
    //     return Inertia::render('Property/PropertyForm');
    // }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'relation_to_property' => 'required|string',
            'address_line_1' => 'required|string',
            'address_line_2' => 'nullable|string',
            'city' => 'required|string',
            'phone1' => 'required|string',
            'phone2' => 'nullable|string',
            'fax' => 'nullable|string',
            'email' => 'required|email',
            'heard_about_us' => 'nullable|string',
            'property_name' => 'required|string|max:255',
            'property_address_line_1' => 'required|string',
            'property_address_line_2' => 'nullable|string',
            'property_city' => 'required|string',
            'postal_code' => 'required|string',
            'number_of_units' => 'required|integer',
            'total_commercial_units' => 'nullable|integer',
            'total_commercial_space_sqft' => 'nullable|integer',
            'year_built' => 'nullable|integer',
            'developer' => 'nullable|string',
            'condominium_plan_number' => 'nullable|string',
            'property_type' => 'required|string',
            'property_styles' => 'nullable|array',
            'each_unit_has_furnace' => 'nullable|boolean',
            'each_unit_has_electrical_meter' => 'nullable|boolean',
            'has_onsite_caretaker' => 'nullable|boolean',
            'parking' => 'nullable|string',
            'amenities' => 'nullable|array',
            'other_amenities' => 'nullable|string',
            'additional_info' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('property_images', 'public');
            $validatedData['image_path'] = $imagePath;
        }

        Property::create($validatedData);

        return redirect()->back()->with('success', 'Property applied successfully!');
    }
}