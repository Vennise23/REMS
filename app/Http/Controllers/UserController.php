<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Import the Log facade
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

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
            $validator = Validator::make($request->all(), [
                'firstname' => 'required|string|min:2',
                'lastname' => 'required|string|min:2',
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users'),
                    'ends_with:.com'
                ],
                'password' => 'required|min:8|confirmed',
                'ic_number' => [
                    'required',
                    'string',
                    Rule::unique('users'),
                    'regex:/^\d{12}$/'
                ],
                'phone' => [
                    'nullable',
                    'string',
                    'regex:/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/'
                ],
                'role' => 'required|in:user,admin',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ], [
                'email.unique' => 'This email is already registered.',
                'email.ends_with' => 'Email must end with .com',
                'ic_number.unique' => 'This IC number is already registered.',
                'phone.regex' => 'Please enter a valid Malaysian phone number.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->except('profile_picture');
            $data['password'] = Hash::make($request->password);

            if ($request->hasFile('profile_picture')) {
                $path = $request->file('profile_picture')->store('profile-pictures', 'public');
                $data['profile_picture'] = $path;
            }

            $user = User::create($data);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the user',
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
}
