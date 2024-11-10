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

    public function index(Request $request)
    {
        try {
            \Log::info('Received request params:', $request->all());
            
            $perPage = $request->query('per_page', 6);
            $query = Property::query();

            // 处理属性类型筛选
            if ($request->has('propertyType') && $request->propertyType !== 'All Property') {
                $query->where('property_type', $request->propertyType);
            }

            // 处理价格范围筛选
            if ($request->has('priceMin') && $request->priceMin !== '0') {
                $query->where('price', '>=', $request->priceMin);
            }
            if ($request->has('priceMax') && $request->priceMax !== '0') {
                $query->where('price', '<=', $request->priceMax);
            }

            // 处理面积范围筛选
            if ($request->has('sizeMin') && $request->sizeMin !== '0') {
                $query->where('square_feet', '>=', $request->sizeMin);
            }
            if ($request->has('sizeMax') && $request->sizeMax !== '0') {
                $query->where('square_feet', '<=', $request->sizeMax);
            }

            $properties = $query->paginate($perPage);
            
            \Log::info('Returning properties:', [
                'total' => $properties->total(),
                'per_page' => $properties->perPage(),
                'current_page' => $properties->currentPage(),
                'count' => $properties->count()
            ]);
            
            return response()->json($properties);
        } catch (\Exception $e) {
            \Log::error('Error in index method: ' . $e->getMessage());
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
            
            if ($property->certificate_photos) {
                $certificatePhotos = is_string($property->certificate_photos) 
                    ? json_decode($property->certificate_photos, true) 
                    : $property->certificate_photos;

                if (is_array($certificatePhotos)) {
                    foreach ($certificatePhotos as $photo) {
                        \Log::info('Photo path: ' . $photo);
                        \Log::info('Full storage path: ' . storage_path('app/public/' . $photo));
                        \Log::info('File exists: ' . (Storage::disk('public')->exists($photo) ? 'yes' : 'no'));
                        
                        if (Storage::disk('public')->exists($photo)) {
                            $photos[] = url('storage/' . $photo);
                        }
                    }
                }
            }
            
            \Log::info('Returning photos:', $photos);
            return response()->json($photos);
        } catch (\Exception $e) {
            \Log::error('Error in getPropertyPhotos: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $property = Property::findOrFail($id);
            
            // 确保返回的是数组而不是对象
            $propertyArray = $property->toArray();
            
            // 处理照片 URL
            if (!empty($propertyArray['certificate_photos'])) {
                $propertyArray['certificate_photos'] = array_map(function($photo) {
                    return url('storage/' . $photo);
                }, is_array($propertyArray['certificate_photos']) 
                    ? $propertyArray['certificate_photos'] 
                    : json_decode($propertyArray['certificate_photos'], true) ?? []);
            }

            if (!empty($propertyArray['property_photos'])) {
                $propertyArray['property_photos'] = array_map(function($photo) {
                    return url('storage/' . $photo);
                }, is_array($propertyArray['property_photos']) 
                    ? $propertyArray['property_photos'] 
                    : json_decode($propertyArray['property_photos'], true) ?? []);
            }

            \Log::info('Rendering PropertyDetail with:', [
                'property' => $propertyArray,
                'auth' => ['user' => auth()->user()]
            ]);

            return Inertia::render('PropertyDetail', [
                'property' => $propertyArray,
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in show method: ' . $e->getMessage());
            return redirect()->route('buy')->with('error', 'Property not found');
        }
    }
}