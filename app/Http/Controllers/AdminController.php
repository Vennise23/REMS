<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/AdminDashboard');
    }

    public function manageUsers()
    {
        try {
            $users = User::all(); // Fetch all users
            return Inertia::render('Admin/AdminUserMng', ['users' => $users]);
        } catch (\Exception $e) {
            // \Log::error("Error fetching users: " . $e->getMessage());
            return response()->json(['error' => 'Could not retrieve users'], 500);
        }
    }


    public function store(Request $request)
    {
        $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'ic_number' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:1|max:100',
            'born_date' => 'nullable|date',
            'phone' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'role' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Validate profile picture
        ]);

        $user = new User([
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'ic_number' => $request->ic_number,
            'age' => $request->age,
            'born_date' => $request->born_date,
            'phone' => $request->phone,
            'address_line_1' => $request->address_line_1,
            'address_line_2' => $request->address_line_2,
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'role' => $request->role ?? 'user',
            'password' => Hash::make($request->password),
        ]);

        if ($request->hasFile('profile_picture')) {
            $filePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $filePath;
        }

        $user->save();

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'ic_number' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:1|max:100',
            'born_date' => 'nullable|date',
            'phone' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'role' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user->update([
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'ic_number' => $request->ic_number,
            'age' => $request->age,
            'born_date' => $request->born_date,
            'phone' => $request->phone,
            'address_line_1' => $request->address_line_1,
            'address_line_2' => $request->address_line_2,
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'role' => $request->role ?? $user->role,
        ]);

        // Handle profile picture update
        if ($request->hasFile('profile_picture')) {
            // Delete the old profile picture if it exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            // Store the new profile picture
            $filePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $filePath;
        }

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Delete profile picture if exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $user->delete();

        return response()->json(['status' => 'User deleted successfully']);
    }

    public function manageProperties()
    {
        return Inertia::render('Admin/AdminPropertyMng');
    }

    public function propertyTable()
    {
        $properties = Property::all();
        return response()->json($properties);
    }

    public function approveProperty($id)
    {
        $property = Property::findOrFail($id);
        $property->approval_status = 'Approved';
        $property->save();

        $pendingCount = DB::table('properties')->where('approval_status', 'Pending')->count();

        return response()->json([
            'status' => 'Property approved successfully',
            'pendingCount' => $pendingCount,
        ]);
    }

    public function rejectProperty($id)
    {
        $property = Property::findOrFail($id);
        $property->approval_status = 'Rejected';
        $property->save();

        $pendingCount = DB::table('properties')->where('approval_status', 'Pending')->count();

        return response()->json([
            'status' => 'Property rejected successfully',
            'pendingCount' => $pendingCount,
        ]);
    }

    public function getPendingCount()
    {
        try {
            $pendingCount = Property::where('approval_status', 'pending')->count();
            return response()->json(['pendingCount' => $pendingCount]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
