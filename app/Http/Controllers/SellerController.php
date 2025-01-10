<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SellerController extends Controller
{
    public function search(Request $request)
    {
        Log::info('Search parameters:', $request->all());

        $query = User::where('role', 'seller')
            ->with(['properties' => function ($query) {
                $query->where('approval_status', 'Approved');
            }]);

        // Apply region filter
        if ($request->region) {
            $query->whereHas('properties', function ($q) use ($request) {
                $q->where('state', $request->region);
            });
        }

        // Fix property type filter
        if ($request->propertyType && $request->propertyType !== '' && $request->propertyType !== 'all') {
            $query->whereHas('properties', function ($q) use ($request) {
                $q->where('property_type', 'LIKE', '%' . $request->propertyType . '%');
            });
        }

        // Improve name search with more detailed logging
        if ($request->searchTerm) {
            $searchTerm = '%' . strtolower(trim($request->searchTerm)) . '%';
            Log::info('Searching for term:', ['searchTerm' => $searchTerm]);

            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(firstname) LIKE ?', [$searchTerm])
                  ->orWhereRaw('LOWER(lastname) LIKE ?', [$searchTerm])
                  ->orWhereRaw("LOWER(CONCAT(firstname, ' ', lastname)) LIKE ?", [$searchTerm]);
            });

            // Log the actual SQL query and bindings
            Log::info('Search Query:', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);
        }

        // Get results and log them
        $sellers = $query->get();
        Log::info('Found sellers count:', ['count' => $sellers->count()]);

        $formattedSellers = $sellers->map(function ($seller) {
            Log::info('Seller details:', [
                'id' => $seller->id,
                'name' => $seller->firstname . ' ' . $seller->lastname,
                'role' => $seller->role
            ]);

            return [
                'id' => $seller->id,
                'firstname' => $seller->firstname,
                'lastname' => $seller->lastname,
                'profile_picture' => $seller->profile_picture 
                    ? asset('storage/profile_pictures/' . basename($seller->profile_picture)) 
                    : asset('images/default-avatar.png'),
                'agency_name' => $seller->agency_name ?? '',
                'property_count' => $seller->properties->count(),
            ];
        });

        return response()->json($formattedSellers);
    }

    public function profile($id)
    {
        $seller = User::findOrFail($id);
        $sellerProperties = Property::where('user_id', $id)
            ->latest()
            ->get()
            ->map(function ($property) {
                // Transform the property_photos array into full URLs
                $property->images = collect($property->property_photos)->map(function ($photo) {
                    return asset('storage/property_photos/' . $photo);
                })->toArray();
                return $property;
            });

        return Inertia::render('SellerProfile', [
            'seller' => $seller,
            'sellerProperties' => $sellerProperties
        ]);
    }

    public function getSellerProperties(Request $request)
    {
        try {
            if (!$request->sellerId) {
                return response()->json(['error' => 'Seller ID is required'], 400);
            }

            $query = Property::query()
                ->where('user_id', $request->sellerId)
                ->where('status', 'available');

            // Add logging to debug
            Log::info('Query parameters:', [
                'sellerId' => $request->sellerId,
                'filters' => $request->all()
            ]);

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

            $properties = $query->paginate($request->per_page ?? 6);
            
            Log::info('Properties found:', [
                'count' => count($properties->items()),
                'total' => $properties->total()
            ]);

            return response()->json($properties);

        } catch (\Exception $e) {
            Log::error('Error in getSellerProperties:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch properties',
                'message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
} 