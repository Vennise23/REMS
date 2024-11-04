<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'nullable|integer',
            'username' => 'nullable|string|max:255',
            'property_name' => 'required|string|max:255',
            'property_title' => 'required|string|max:255',
            'property_type' => 'required|string|in:Conventional Condominium,Bare Land Condominium,Commercial,Other / Not Sure',
            'property_address_line_1' => 'required|string|max:255',
            'property_address_line_2' => 'nullable|string|max:255',
            'property_city' => 'required|string|max:255',
            'property_postal_code' => 'required|string|max:10',
            'number_of_units' => 'required|integer',
            'total_commercial_units' => 'nullable|integer',
            'total_commercial_space_sqft' => 'nullable|integer',
            'year_built' => 'nullable|integer',
            'developer' => 'nullable|string|max:255',
            'certificate_number' => 'nullable|string|max:255',
            'certificate_photos' => 'nullable|array',
            'property_photos' => 'nullable|array',
            'each_unit_has_furnace' => 'nullable|boolean',
            'each_unit_has_electrical_meter' => 'nullable|boolean',
            'has_onsite_caretaker' => 'nullable|boolean',
            'parking' => 'nullable|string|in:Above ground,Underground,Both',
            'amenities' => 'nullable|array',
            'other_amenities' => 'nullable|string|max:255',
            'additional_info' => 'nullable|string',
        ]);

        // Store the certificate and property photos
        if ($request->hasFile('certificate_photos')) {
            $certificatePhotos = [];
            foreach ($request->file('certificate_photos') as $photo) {
                $certificatePhotos[] = $photo->store('certificate_photos', 'public');
            }
            $validatedData['certificate_photos'] = $certificatePhotos;
        }

        if ($request->hasFile('property_photos')) {
            $propertyPhotos = [];
            foreach ($request->file('property_photos') as $photo) {
                $propertyPhotos[] = $photo->store('property_photos', 'public');
            }
            $validatedData['property_photos'] = $propertyPhotos;
        }

        Property::create($validatedData);

        return redirect()->back()->with('success', 'Property created successfully!');
    }
}
