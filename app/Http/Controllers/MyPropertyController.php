<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\ChatRoom;

// This class handle all properties action on User's site.
class MyPropertyController extends Controller
{
    public function showMyPropertyForm()
    {
        $user = Auth::user();
        $properties = Property::where('user_id', $user->id)
            ->where('approval_status', 'Approved')
            ->with(['buyer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Property/MyProperties', [
            'properties' => $properties
        ]);
    }

    public function updateStatus(Request $request, Property $property)
    {
        $request->validate([
            'status' => 'required|in:available,sold,rented,cancelled',
            'buyer_id' => 'required_if:status,sold,rented|exists:users,id'
        ]);

        if (!$this->canUpdateStatus($property)) {
            return response()->json([
                'message' => 'You are not authorized to update this property\'s status'
            ], 403);
        }

        $property->status = $request->status;
        if (in_array($request->status, ['sold', 'rented'])) {
            $property->buyer_id = $request->buyer_id;
            $property->transaction_date = now();
        }

        $property->save();

        return response()->json([
            'message' => 'Property status updated successfully',
            'property' => $property
        ]);
    }

    private function canUpdateStatus(Property $property)
    {
        $user = Auth::user();
        return $user->id === $property->user_id;
    }

    // User Property Management --
    public function showPropertyManagementForm()
    {
        $userid = Auth::id(); 
        $properties = Property::where('user_id', $userid)
                              ->orderBy('created_at', 'desc')
                              ->paginate(10);
        return Inertia::render('Property/PropertyManagement', [
            'properties' => $properties,
        ]);
    }

    public function isPropertyNameAlreadyExist($name)
    {
        $property = Property::where('property_name', $name)->first();
        return response()->json(['exists' => $property ? true : false]);
    }

    public function saveNew(Request $request)
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
                'postal_code' => 'nullable|string|max:255',
                'state' => 'required|string|max:255',
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
                }
                $validatedData['property_photos'] = $propertyPhotos;
            }

            Property::create($validatedData);

            return response()->json(['message' =>  'Property created successfully!']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json($e->validator->errors(), 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'property_name' => 'required|string|max:255',
                'property_type' => 'required|string|in:Conventional Condominium,Bare Land Condominium,Commercial',
                'property_address_line_1' => 'required|string|max:255',
                'property_address_line_2' => 'nullable|string|max:255',
                'city' => 'required|string|max:255',
                'postal_code' => 'nullable|string|max:255',
                'purchase' => 'required|string|in:For Sale,For Rent',
                'sale_type' => 'nullable|string|in:New Launch,Subsale',
                'number_of_units' => 'required|integer',
                'square_feet' => 'nullable|integer|min:1',
                'price' => 'required|numeric|min:0',
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

            $property = Property::findOrFail($id);

            if ($property->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if (isset($validatedData['amenities'])) {
                $validatedData['amenities'] = array_map(function ($amenity) {
                    return trim($amenity);
                }, $validatedData['amenities']);
            }

            if ($request->hasFile('certificate_photos')) {
                $certificatePhotos = $property->certificate_photos ?: [];
                foreach ($request->file('certificate_photos') as $photo) {
                    $certificatePhotos[] = $photo->store('certificate_photos', 'public');
                }
                $validatedData['certificate_photos'] = $certificatePhotos;
            }

            if ($request->hasFile('property_photos')) {
                $propertyPhotos = $property->property_photos ?: [];
                foreach ($request->file('property_photos') as $photo) {
                    $propertyPhotos[] = $photo->store('property_photos', 'public');
                }
                $validatedData['property_photos'] = $propertyPhotos;
            }

            $validatedData['approval_status'] = 'Pending';
            $validatedData['is_read'] = '0';
            $property->update($validatedData);

            return response()->json([
                'message' => 'Property updated successfully',
                'data' => $property,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->validator->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id)
    {
        $property = Property::find($id);

        // Check authorization
        if ($property->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'.$property->user_id ."   ". Auth::id()], 403);
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
}
