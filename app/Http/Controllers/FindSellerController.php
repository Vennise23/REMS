<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FindSellerController extends Controller
{
    public function getSellerProperties(Request $request)
    {
        try {
            if (!$request->sellerId) {
                return response()->json(['error' => 'Seller ID is required'], 400);
            }

            if (!auth()->check()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            Log::info('Seller Properties Request:', $request->all());

            $query = Property::query()
                ->where('user_id', $request->sellerId)
                ->where('status', 'available');

            if ($request->propertyType && $request->propertyType !== 'All Property') {
                $query->where('property_type', $request->propertyType);
            }

            if ($request->saleType && $request->saleType !== 'All') {
                $query->where('purchase', $request->saleType);
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

            if ($request->amenities) {
                $amenities = explode(',', $request->amenities);
                foreach ($amenities as $amenity) {
                    if ($amenity) {
                        $query->whereJsonContains('amenities', $amenity);
                    }
                }
            }

            $properties = $query->with('user')->paginate($request->per_page ?? 6);

            $formattedResponse = [
                'data' => $properties->items(),
                'total' => $properties->total(),
                'per_page' => $properties->perPage(),
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage()
            ];

            $formattedResponse['data'] = array_map(function($property) {
                if (!empty($property['property_photos'])) {
                    $photos = is_array($property['property_photos']) ? 
                        $property['property_photos'] : 
                        json_decode($property['property_photos'], true) ?? [];
                    
                    $property['property_photos'] = array_map(function($photo) {
                        return $photo ? asset('storage/' . $photo) : null;
                    }, array_filter($photos));
                }

                $property['size'] = $property['square_feet'];
                return $property;
            }, $formattedResponse['data']);

            Log::info('Properties found:', ['count' => count($formattedResponse['data'])]);
            return response()->json($formattedResponse);

        } catch (\Exception $e) {
            Log::error('Seller Properties Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user' => auth()->id(),
                'sellerId' => $request->sellerId
            ]);
            
            return response()->json([
                'error' => 'Internal Server Error',
                'message' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }
} 