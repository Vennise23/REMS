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

    public function showBuyPage(Request $request)
    {
        try {
            $query = Property::query();

            // 添加筛选条件
            if ($request->filled('propertyType') && $request->propertyType !== 'All Property') {
                $query->where('property_type', $request->propertyType);
            }

            if ($request->filled('priceMin')) {
                $query->where('price', '>=', $request->priceMin);
            }

            if ($request->filled('priceMax')) {
                $query->where('price', '<=', $request->priceMax);
            }

            if ($request->filled('sizeMin')) {
                $query->where('square_feet', '>=', $request->sizeMin);
            }

            if ($request->filled('sizeMax')) {
                $query->where('square_feet', '<=', $request->sizeMax);
            }

            // 获取分页数据
            $properties = $query->paginate(6)->through(function ($property) {
                // 确保所有必要的字段都存在
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'property_type' => $property->property_type,
                    'city' => $property->city,
                    'price' => $property->price,
                    'square_feet' => $property->square_feet,
                    'number_of_units' => $property->number_of_units,
                    'purchase' => $property->purchase,
                    'property_photos' => $property->property_photos,
                ];
            });

            // 调试输出
            \Log::info('Properties data:', ['properties' => $properties]);
            
            return Inertia::render('Buy', [
                'auth' => [
                    'user' => auth()->user()
                ],
                'properties' => $properties,
                'filters' => $request->all() // 返回当前筛选条件
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in showBuyPage: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}