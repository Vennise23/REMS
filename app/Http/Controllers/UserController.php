<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Import the Log facade
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
    {
        try {
            $users = User::select([
                'id',
                'firstname',
                'lastname',
                'email',
                'phone',
                'role',
                'profile_picture',
                'ic_number',
                'age',
                'born_date',
                'address_line_1',
                'address_line_2',
                'city',
                'postal_code'
            ])->get();

            // Transform the data to include profile picture URL
            $users = $users->map(function ($user) {
                return [
                    ...$user->toArray(),
                    'profile_picture_url' => $user->profile_picture 
                        ? asset('storage/' . $user->profile_picture) 
                        : null
                ];
            });

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching users',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Store a new user with all fields
    public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string',
            'ic_number' => 'required|string|size:12|unique:users',
            'address_line_1' => 'required|string',
            'city' => 'required|string',
            'postal_code' => 'required|string',
            'password' => 'required|min:8',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Handle file upload
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('public/profile_pictures', $filename);
            $validated['profile_picture'] = $filename;
        }

        // Hash password
        $validated['password'] = Hash::make($validated['password']);

        // Create user
        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $user
        ], 201);

    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error creating user',
            'error' => $e->getMessage()
        ], 500);
    }
}

    // Update an existing user
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $rules = [
                'firstname' => 'sometimes|required|string|min:2',
                'lastname' => 'sometimes|required|string|min:2',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    Rule::unique('users')->ignore($id),
                ],
                'ic_number' => [
                    'sometimes',
                    'required',
                    'string',
                    Rule::unique('users')->ignore($id),
                    'regex:/^\d{12}$/',
                ],
                'phone' => 'sometimes|required|string|regex:/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/',
                'password' => 'nullable|min:8',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'role' => 'sometimes|required|in:user,admin',
                'age' => 'sometimes|nullable|integer|min:1|max:150',
                'born_date' => 'sometimes|nullable|date',
                'address_line_1' => 'sometimes|nullable|string',
                'address_line_2' => 'sometimes|nullable|string',
                'city' => 'sometimes|nullable|string',
                'postal_code' => 'sometimes|nullable|string',
            ];

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->except(['password', 'profile_picture']);

            // Handle profile picture
            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }

                // Store new profile picture
                $path = $request->file('profile_picture')->store('profile-pictures', 'public');
                $data['profile_picture'] = $path;
            }

            // Handle password
            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => [
                    ...$user->toArray(),
                    'profile_picture_url' => $user->profile_picture ? Storage::url($user->profile_picture) : null
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the user',
                'error' => $e->getMessage()
            ], 500);
        }
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

    public function checkICAvailability(Request $request)
    {
        $request->validate([
            'ic_number' => 'required|string|size:12'
        ]);

        $exists = User::where('ic_number', $request->ic_number)->exists();
        
        return response()->json([
            'available' => !$exists
        ]);
    }

    public function checkNameUniqueness(Request $request)
    {
        try {
            $request->validate([
                'firstname' => 'required|string|min:2',
                'lastname' => 'required|string|min:2',
                'user_id' => 'nullable|integer'
            ]);

            $query = User::where('firstname', $request->firstname)
                        ->where('lastname', $request->lastname);

            if ($request->user_id) {
                $query->where('id', '!=', $request->user_id);
            }

            $exists = $query->exists();

            return response()->json([
                'available' => !$exists
            ]);

        } catch (\Exception $e) {
            Log::error('Name check error: ' . $e->getMessage());
            return response()->json([
                'available' => false,
                'error' => 'Error checking name availability'
            ], 200); // Return 200 to avoid CORS issues
        }
    }

    public function checkEmailUniqueness(Request $request)
    {
        $query = User::where('email', $request->email);
        if ($request->user_id) {
            $query->where('id', '!=', $request->user_id);
        }
        return response()->json([
            'available' => !$query->exists()
        ]);
    }

    public function checkIcUniqueness(Request $request)
    {
        $query = User::where('ic_number', $request->ic_number);
        if ($request->user_id) {
            $query->where('id', '!=', $request->user_id);
        }
        return response()->json([
            'available' => !$query->exists()
        ]);
    }
}
