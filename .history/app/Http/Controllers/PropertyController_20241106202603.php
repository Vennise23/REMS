<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'user_id' => 'nullable|integer',
                'username' => 'nullable|string|max:255',
                'property_name' => 'required|string|max:255',
                'property_type' => 'required|string|in:Conventional Condominium,Bare Land Condominium,Commercial',
                'property_address_line_1' => 'required|string|max:255',
                'property_address_line_2' => 'nullable|string|max:255',
                'city' => 'required|string|max:255',
                'postal_code' => 'required|string|max:10',
                'purchase' => 'required|string|in:For Sale,For Rent',
                'sale_type' => 'nullable|string|in:New Launch,Subsale',
                'number_of_units' => 'required|integer',
                'square_feet' => 'nullable|integer',
                'price' => 'required|numeric',
                'property_photos' => 'nullable|array',
                'each_unit_has_furnace' => 'nullable|boolean',
                'each_unit_has_electrical_meter' => 'nullable|boolean',
                'has_onsite_caretaker' => 'nullable|boolean',
                'parking' => 'nullable|string|in:Above ground,Underground,Both',
                'amenities' => 'nullable|array',
                'other_amenities' => 'nullable|string|max:255',
                'additional_info' => 'nullable|string',
            ]);

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
                    $path = $photo->store('property_photos', 'public');
                    $propertyPhotos[] = asset('storage/' . $path);
                }
                $validatedData['property_photos'] = $propertyPhotos;
            }

            Property::create($validatedData);

            return redirect()->back()->with('success', 'Property created successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json($e->validator->errors(), 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        try {
            $properties = Property::all();
            return response()->json($properties);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function showBuyPage()
    {
        try {
            // 每页显示6个属性
            $properties = Property::paginate(6);
            
            return Inertia::render('Buy', [
                'auth' => [
                    'user' => auth()->user()
                ],
                'properties' => $properties
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getPropertyPhotos($propertyId)
    {
        try {
            $property = Property::findOrFail($propertyId);
            $photos = [];
            
            // 获取证书照片
            if (isset($property->certificate_photos)) {
                $certificatePhotos = is_string($property->certificate_photos) 
                    ? json_decode($property->certificate_photos, true) 
                    : $property->certificate_photos;

                if (is_array($certificatePhotos)) {
                    foreach ($certificatePhotos as $photo) {
                        // 直接返回存储路径
                        $photos[] = asset('storage/' . $photo);
                    }
                }
            }
            
            return response()->json($photos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}