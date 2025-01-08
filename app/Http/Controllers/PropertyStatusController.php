<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ChatRoom;

class PropertyStatusController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $properties = Property::where('user_id', $user->id)
            ->where('approval_status','Approved')
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

    public function getPotentialBuyers(Property $property)
    {
        // 获取与该房产相关的聊天室中的买家
        $chatRooms = ChatRoom::where('property_id', $property->id)
            ->with('buyer')
            ->get();

        $buyers = $chatRooms->map(function ($room) {
            return $room->buyer;
        })->unique('id')->values();

        return response()->json($buyers);
    }
} 