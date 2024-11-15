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

            // 标准化设施名称
            if (isset($validatedData['amenities'])) {
                $validatedData['amenities'] = array_map(function($amenity) {
                    return trim($amenity);
                }, $validatedData['amenities']);
            }

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

    public function GetPropertyList()
    {
        $properties = Property::all();
        return response()->json($properties);
    }

    public function index(Request $request)
    {
        try {
            $query = Property::query();

            // 根据页面类型设置购买类型
            $purchaseType = $request->input('purchase', 'For Sale');
            $query->where('purchase', $purchaseType);

            // 属性类型筛选
            if ($request->has('propertyType') && $request->propertyType !== 'All Property') {
                $query->where('property_type', $request->propertyType);
            }

            // 其他筛选条件...
            if ($request->has('priceMin')) {
                $query->where('price', '>=', $request->priceMin);
            }
            if ($request->has('priceMax')) {
                $query->where('price', '<=', $request->priceMax);
            }
            if ($request->has('sizeMin')) {
                $query->where('square_feet', '>=', $request->sizeMin);
            }
            if ($request->has('sizeMax')) {
                $query->where('square_feet', '<=', $request->sizeMax);
            }
            if ($request->has('citySearch') && !empty($request->citySearch)) {
                $query->where('city', 'like', '%' . $request->citySearch . '%');
            }
            if ($request->has('amenities') && !empty($request->amenities)) {
                $amenities = explode(',', $request->amenities);
                foreach ($amenities as $amenity) {
                    if (!empty(trim($amenity))) {
                        $query->whereJsonContains('amenities', trim($amenity));
                    }
                }
            }
            if ($request->has('saleType') && $request->saleType !== 'All') {
                $query->where('sale_type', $request->saleType);
            }

            $properties = $query->paginate($request->input('per_page', 6));

            return response()->json([
                'data' => $properties->items(),
                'total' => $properties->total(),
                'per_page' => $properties->perPage(),
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage()
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function showBuyPage()
    {
        return Inertia::render('Buy', [
            'auth' => ['user' => auth()->user()]
        ]);
    }

    public function showRentPage()
    {
        return Inertia::render('Rent', [
            'auth' => ['user' => auth()->user()]
        ]);
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
                        if (Storage::disk('public')->exists($photo)) {
                            $photos[] = url('storage/' . $photo);
                        }
                    }
                }
            }
            return response()->json($photos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $property = Property::findOrFail($id);
            
            // 处理照片 URL，确保数据格式正确
            $propertyArray = array_merge($property->toArray(), [
                'certificate_photos' => is_array($property->certificate_photos) 
                    ? array_map(fn($photo) => url('storage/' . $photo), $property->certificate_photos)
                    : [],
                'property_photos' => is_array($property->property_photos)
                    ? $property->property_photos
                    : [],
                'amenities' => is_array($property->amenities) ? $property->amenities : [],
            ]);

            // 确保所有必要的字段都有默认值
            $propertyArray = array_merge([
                'username' => 'Anonymous',
                'additional_info' => '',
                'property_address_line_2' => '',
                'other_amenities' => '',
            ], $propertyArray);

            return Inertia::render('PropertyDetail', [
                'property' => $propertyArray,
                'auth' => ['user' => auth()->user()]
            ]);
        } catch (\Exception $e) {
            return redirect()->route('buy')->with('error', 'Property not found');
        }
    }

    public function searchNearby(Request $request)
    {
        try {
            $latitude = $request->input('latitude');
            $longitude = $request->input('longitude');
            $radius = $request->input('radius', 10); // 默认10公里
            $perPage = $request->input('per_page', 6);

            // 使用 Haversine 公式计算距离（单位：公里）
            $query = Property::select('*')
                ->selectRaw('
                    (6371 * acos(
                        cos(radians(?)) * 
                        cos(radians(CAST(latitude AS DOUBLE PRECISION))) * 
                        cos(radians(CAST(longitude AS DOUBLE PRECISION)) - radians(?)) + 
                        sin(radians(?)) * 
                        sin(radians(CAST(latitude AS DOUBLE PRECISION)))
                    )) AS distance', 
                    [$latitude, $longitude, $latitude]
                )
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->having('distance', '<=', $radius)
                ->orderBy('distance');

            // 保持现有的筛选条件
            if ($request->has('propertyType') && $request->propertyType !== 'All Property') {
                $query->where('property_type', $request->propertyType);
            }

            if ($request->has('amenities') && !empty($request->amenities)) {
                $amenities = explode(',', $request->amenities);
                foreach ($amenities as $amenity) {
                    $query->whereJsonContains('amenities', trim($amenity));
                }
            }

            $properties = $query->paginate($perPage);

            return response()->json($properties);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
