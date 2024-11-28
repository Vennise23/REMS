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

            $user = auth()->user();

            if (!$user) {
                return response()->json(['error' => 'User is not authenticated'], 401);
            }

            $validatedData['username'] = $user->firstname . ' ' . $user->lastname;

            $validatedData['user_id'] = $user->id;

            if (isset($validatedData['amenities'])) {
                $validatedData['amenities'] = array_map(function ($amenity) {
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
                    $propertyPhotos[] = $photo->store('property_photos', 'public');
                    // $path = $photo->store('property_photos', 'public');
                    // $propertyPhotos[] = asset('storage/' . $path);
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
            $purchaseType = $request->input('purchase', 'For Sale');
            $query->where('purchase', $purchaseType);

            if ($request->has('propertyType') && $request->propertyType !== 'All Property') {
                $query->where('property_type', $request->propertyType);
            }

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
                $citySearch = $request->citySearch;
                $query->where(function ($subQuery) use ($citySearch) {
                    $subQuery->whereRaw("CONCAT_WS(', ', property_address_line_1, COALESCE(property_address_line_2, ''), city) LIKE ?", ['%' . $citySearch . '%'])
                        ->orWhere('property_name', 'like', '%' . $citySearch . '%');
                });
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
            if ($property->property_photos) {
                $propertyPhotos = is_string($property->property_photos)
                    ? json_decode($property->property_photos, true)
                    : $property->property_photos;

                if (is_array($propertyPhotos)) {
                    foreach ($propertyPhotos as $photo) {
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

    public function showInformationById($id)
    {
        try {
            $property = Property::with('user')->findOrFail($id);

            $propertyArray = array_merge($property->toArray(), [
                'certificate_photos' => is_array($property->certificate_photos)
                    ? array_map(fn($photo) => url('storage/' . $photo), $property->certificate_photos)
                    : [],
                'property_photos' => is_array($property->property_photos)
                    ? array_map(fn($photo) => url('storage/' . $photo), $property->property_photos)
                    : [],
                'amenities' => is_array($property->amenities) ? $property->amenities : [],
            ]);

            $propertyArray = array_merge([
                'username' => 'Anonymous',
                'additional_info' => '',
                'property_address_line_2' => '',
                'other_amenities' => '',
            ], $propertyArray);

            $user = $property->user;

            $response = [
                'property' => $propertyArray,
                'user_phone' => $user ? $this->formatPhoneNumber($user->phone) : null,
                'user_email' => $user ? $user->email : null,
            ];

            if (request()->expectsJson()) {
                return response()->json($response);
            }

            return Inertia::render('PropertyDetail', [
                'property' => $propertyArray,
                'auth' => ['user' => auth()->user()],
            ]);
        } catch (\Exception $e) {
            return redirect()->route('buy')->with('error', 'Property not found');
        }
    }

    private function formatPhoneNumber($phone)
    {
        if (empty($phone) || strlen($phone) < 10) {
            return null;
        }

        $phone = ltrim($phone, '0');

        $formatted = '+60 ' . substr($phone, 0, 2) . '-' . substr($phone, 2, 3) . ' ' . substr($phone, 5);

        return $formatted;
    }

    public function searchNearby(Request $request)
    {
        try {
            $latitude = $request->input('latitude');
            $longitude = $request->input('longitude');
            $radius = $request->input('radius', 10);
            $perPage = $request->input('per_page', 6);

            $query = Property::select('*')
                ->selectRaw(
                    '
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

    public function checkPropertyName($name)
    {
        $property = Property::where('property_name', $name)->first();
        return response()->json(['exists' => $property ? true : false]);
    }

    public function searchAddresses(Request $request)
    {
        $query = $request->input('query', '');
        if (empty($query)) {
            return response()->json([]);
        }

        $addresses = Property::select('property_address_line_1', 'property_address_line_2', 'city', 'property_name', 'property_type')
            ->where('property_address_line_1', 'like', '%' . $query . '%')
            ->orWhere('property_address_line_2', 'like', '%' . $query . '%')
            ->orWhere('city', 'like', '%' . $query . '%')
            ->orWhere('property_name', 'like', '%' . $query . '%')
            ->limit(10)
            ->get();

        return response()->json($addresses);
    }
}
