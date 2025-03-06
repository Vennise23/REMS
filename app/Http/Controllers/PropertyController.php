<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\ChatRoom;

class PropertyController extends Controller
{

    public function GetPropertyList()
    {
        $properties = Property::all();// == sql select * from properties
        return response()->json($properties);
    }

    public function index(Request $request)
    {
        try {
            $query = Property::query();
            //$query->where('approval_status', 'Approved');
            $purchaseType = $request->input('purchase', 'For Sale');
            $query->where('approval_status','Approved');
            $query->where('purchase', $purchaseType);

            $sortDirection = in_array($request->input('sortDirection'), ['asc', 'desc']) 
                ? $request->input('sortDirection') 
                : 'desc';
            
            $query->orderBy('created_at', $sortDirection);

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
                    $subQuery->where('property_address_line_1', 'like', '%' . $citySearch . '%')
                        ->orWhere('city', 'like', '%' . $citySearch . '%')
                        ->orWhereRaw("
                            CONCAT_WS(', ', 
                                property_address_line_1, 
                                IFNULL(property_address_line_2, ''), 
                                city
                            ) LIKE ?
                            ", ['%' . $citySearch . '%'])
                        ->orWhereRaw("
                            CONCAT(property_address_line_1, ', ', city) LIKE ?
                            ", ['%' . $citySearch . '%'])
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

            if ($request->has('status')) {
                if ($request->status === 'active') {
                    // 根据购买类型显示不同的状态
                    if ($request->purchase === 'For Sale') {
                        $query->whereIn('status', ['available', 'sold']);
                    } else if ($request->purchase === 'For Rent') {
                        $query->whereIn('status', ['available', 'rented']);
                    }
                } else {
                    $query->where('status', $request->status);
                }
            } else {
                // 默认不显示已取消的
                $query->where('status', '!=', 'cancelled');
            }

            \Log::info('Sort Direction:', [
                'direction' => $request->input('sortDirection'),
                'query' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

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
        // create a new page for rent and with user
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

    public function searchAddresses(Request $request)
    {
        $query = $request->input('query', '');
        if (empty($query)) {
            return response()->json([]);
        }

        $addresses = Property::select('property_address_line_1', 'property_address_line_2', 'city', 'property_name', 'property_type', 'purchase', 'state')
            ->where('property_address_line_1', 'like', '%' . $query . '%')
            ->orWhere('property_address_line_2', 'like', '%' . $query . '%')
            ->orWhere('city', 'like', '%' . $query . '%')
            ->orWhere('property_name', 'like', '%' . $query . '%')
            ->orWhere('state', 'like', '%' . $query . '%')
            ->limit(10)
            ->get();

        return response()->json($addresses);
    }

    public function destroy(Property $property)
    {
        // Check authorization
        if ($property->user_id !== auth()->id() && !auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Delete all related chat rooms and messages
            $chatRooms = ChatRoom::where('property_id', $property->id)->get();
            foreach ($chatRooms as $chatRoom) {
                // Delete all messages in the chat room
                $chatRoom->messages()->delete();
                // Delete the chat room
                $chatRoom->delete();
            }

            // Delete the property
            $property->delete();

            return response()->json(['message' => 'Property deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete property'], 500);
        }
    }

    public function getNotifications(Request $request)
    {
        $properties = Property::where('user_id', auth()->id())
            ->latest()
            ->get();

        $notifications = $properties->map(function ($property) {
            if ($property->approval_status === 'Approved') {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'status' => 'approved',
                    'isRead' => $property->is_read,
                    'message' => 'This property has been approved'
                ];
            } elseif ($property->approval_status === 'Rejected') {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'status' => 'rejected',
                    'isRead' => $property->is_read,
                    'rejection_reason' => $property->rejection_reason,
                    'message' => 'Rejection reason: ' . $property->rejection_reason
                ];
            }
            return null;
        })->filter();

        return response()->json([
            'notifications' => $notifications,
            'totalNotifications' => $notifications->count(),
        ]);
    }

    public function markAsRead($id)
    {
        $property = Property::findOrFail($id);
        $property->is_read = true;
        $property->save();

        return response()->json(['status' => 'success']);
    }

    public function getUserProperties(Request $request)
    {
        $user = $request->user();
        $properties = Property::where('user_id', $user->id)->paginate(10);

        return response()->json([
            'data' => $properties->items(),
            'totalPages' => $properties->lastPage(),
            'total' => $properties->total(),
        ]);
    }


    public function deletePropertyBySeller(Request $request, $id)
    {
        $property = Property::findOrFail($id);
        $property->delete();

        return redirect()->back()->with('success', 'Property deleted successfully!');
    }
}
