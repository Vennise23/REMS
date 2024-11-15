<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Import the Log facade

class UserController extends Controller
{
    // Fetch all users with the updated fields
    public function index()
    {
        try {
            $users = User::select('id', 'firstname', 'lastname', 'email', 'ic_number', 'age', 'born_date', 'phone', 'address_line_1', 'address_line_2', 'city', 'postal_code', 'role', 'profile_picture', 'created_at', 'updated_at')->get();
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch users. Please check the server logs for more details.'], 500);
        }
    }

    // Store a new user with all fields
    public function store(Request $request)
    {
        try {
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
                'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::create([
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
                $user->save();
            }

            return response()->json($user, 201);
        } catch (\Exception $e) {
            Log::error('Error storing user:', ['message' => $e->getMessage()]); // Log the error
            return response()->json(['error' => 'An error occurred while creating the user.'], 500);
        }
    }

    // Update an existing user
    public function update(Request $request, $id)
    {
        Log::info('Update Request Data:', $request->all()); // Log the incoming request data

        $request->validate([
            'profile_picture' => 'nullable|image|mimes:jpg,png,jpeg,gif,svg|max:2048',
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'ic_number' => 'nullable|string|max:20',
            'age' => 'nullable|integer|min:1|max:100',
            'born_date' => 'nullable|date',
            'phone' => 'nullable|string|max:15',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'role' => 'required|string|in:user,admin',
            'password' => 'nullable|string|min:8',
        ]);

        $user = User::findOrFail($id);

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $path;
        }

        // Update other fields
        $user->firstname = $request->firstname;
        $user->lastname = $request->lastname;
        $user->email = $request->email;
        $user->ic_number = $request->ic_number;
        $user->age = $request->age;
        $user->born_date = $request->born_date;
        $user->phone = $request->phone;
        $user->address_line_1 = $request->address_line_1;
        $user->address_line_2 = $request->address_line_2;
        $user->city = $request->city;
        $user->postal_code = $request->postal_code;
        $user->role = $request->role;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['message' => 'User updated successfully'], 200);
    }

    // Delete a user
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
