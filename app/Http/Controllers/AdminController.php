<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\UserStatus;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Mail\Builder\PermanentEmailBuilder;
use App\Mail\Builder\TemporaryEmailBuilder;

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


    // Store a new user with all fields
    public function store(Request $request)
    {
        try {
            // Log incoming request data
            Log::info('Incoming request data:', $request->all());

            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email',
                'ic_number' => 'required|unique:users,ic_number',
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'age' => 'required|integer|min:18',
                'born_date' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'address_line_1' => 'required|string|max:255',
                'address_line_2' => 'nullable|string|max:255',
                'city' => 'required|string|max:255',
                'postal_code' => 'required|string|max:20',
                'role' => 'required|in:user,admin,seller',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $temporaryPassword = Str::random(12);
            $profile_picture_path = null;

            if ($request->hasFile('profile_picture')) {
                $profile_picture_path = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            // Create user with validated data
            $userData = $validator->validated();
            $userData['password'] = Hash::make($temporaryPassword);
            $userData['profile_picture'] = $profile_picture_path;

            $user = User::create($userData);

            Log::info('About to create email with user details:', [
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email
            ]);

            $builder = new PermanentEmailBuilder();
            $email = $builder
                ->setRecipient($user->email)
                ->setUserDetails(
                    $user->firstname,
                    $user->lastname,
                    $temporaryPassword
                )
                ->buildEmail()
                ->getResult();

            Log::info('Email object created, about to send');

            Mail::send($email);

            Log::info('Email sent successfully');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update an existing user
    public function update(Request $request, $id)
    {
        try {
            // Find the specific user by ID instead of using auth()->id()
            $user = User::findOrFail($id);

            // Log the update attempt
            Log::info('Attempting to update user:', [
                'user_id' => $id,
                'current_data' => $user->toArray(),
                'new_data' => $request->all()
            ]);

            $rules = [
                'firstname' => 'nullable|string|min:2',
                'lastname' => 'nullable|string|min:2',
                'email' => [
                    'nullable',
                    'email',
                    Rule::unique('users')->ignore($id),  // Use $id instead of $user->id
                ],
                'ic_number' => [
                    'nullable',
                    'string',
                    Rule::unique('users')->ignore($id),  // Use $id instead of $user->id
                ],
                'phone' => 'nullable|string',
                'password' => 'nullable|min:8',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'role' => 'nullable|string',
                'age' => 'nullable|integer',
                'born_date' => 'nullable|date',
                'address_line_1' => 'nullable|string',
                'address_line_2' => 'nullable|string',
                'city' => 'nullable|string',
                'postal_code' => 'nullable|string',
                'gender' => 'nullable|string'
            ];

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Handle profile picture
            if ($request->hasFile('profile_picture')) {
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $path = $request->file('profile_picture')->store('profile_pictures', 'public');
                $data['profile_picture'] = $path;
            }

            // Remove null values
            $data = array_filter($data, function ($value) {
                return $value !== null;
            });

            $user->fill($data)->save();

            // Log successful update
            Log::info('User updated successfully:', [
                'user_id' => $id,
                'updated_data' => $data
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('User update error:', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
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
        $property->rejection_reason = null;
        $property->save();

        $pendingCount = DB::table('properties')->where('approval_status', 'Pending')->count();

        $user = $property->user;
        if ($user->role != 'seller' && $user->role != 'admin') {
            $user->role = 'seller';
            $user->save();
        }

        return response()->json([
            'status' => 'Property approved successfully',
            'pendingCount' => $pendingCount,
        ]);
    }

    public function rejectProperty(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $property = Property::findOrFail($id);
        $property->approval_status = 'Rejected';
        $property->rejection_reason = $request->reason;
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

    public function checkIcAvailability(Request $request)
    {
        try {
            $icNumber = $request->input('ic_number');
            $userId = $request->input('user_id');

            $exists = User::where('ic_number', $icNumber)
                ->when($userId, function ($query) use ($userId) {
                    return $query->where('id', '!=', $userId);
                })
                ->exists();

            return response()->json([
                'available' => !$exists,
                'message' => $exists ? 'IC number is already registered' : 'IC number is available'
            ]);
        } catch (\Exception $e) {
            Log::error('IC check error: ' . $e->getMessage());
            return response()->json([
                'available' => false,
                'message' => 'Error checking IC availability'
            ], 500);
        }
    }

    public function checkNameUniqueness(Request $request)
    {
        try {
            Log::info('Checking name uniqueness:', $request->all()); // Add logging

            $query = User::where('firstname', $request->firstname)
                ->where('lastname', $request->lastname);

            // Exclude current user when editing
            if ($request->user_id) {
                $query->where('id', '!=', $request->user_id);
            }

            $exists = $query->exists();

            Log::info('Name check result:', ['exists' => $exists]); // Add logging

            return response()->json([
                'available' => !$exists,
                'debug' => [
                    'firstname' => $request->firstname,
                    'lastname' => $request->lastname,
                    'user_id' => $request->user_id,
                    'exists' => $exists
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Name check error: ' . $e->getMessage());
            return response()->json([
                'available' => false,
                'error' => 'Error checking name availability'
            ]);
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

    public function sendWelcomeEmail(Request $request)
    {
        try {
            $builder = new PermanentEmailBuilder();
            $email = $builder
                ->setRecipient($request->email)
                ->setUserDetails(
                    $request->firstname,
                    $request->lastname,
                    $request->password
                )
                ->buildEmail()
                ->getResult();

            Mail::send($email);

            return response()->json([
                'message' => 'Welcome email sent successfully',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        try {
            $online = $request->boolean('online');
            $location = $request->location;

            $status = UserStatus::updateOrCreate(
                ['user_id' => auth()->id()],
                [
                    'is_online' => $online,
                    'location' => $online ? $location : null,
                    'last_activity' => $online ? now() : null
                ]
            );

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error in updateStatus: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUserStatus($userId)
    {
        try {
            $status = UserStatus::where('user_id', $userId)->first();

            if (!$status || !$status->is_online || !$status->last_activity) {
                return response()->json([
                    'online' => false,
                    'location' => null
                ]);
            }

            $isActive = $status->last_activity > now()->subSeconds(30);

            if (!$isActive) {
                $status->update([
                    'is_online' => false,
                    'location' => null,
                    'last_activity' => null
                ]);
            }

            return response()->json([
                'online' => $isActive,
                'location' => $isActive ? $status->location : null
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting user status: ' . $e->getMessage());
            return response()->json([
                'online' => false,
                'location' => null
            ]);
        }
    }

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
                'postal_code',
                'gender'
            ])->get();

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

    public function checkEmailAvailability(Request $request)
    {
        $email = $request->input('email');
        $userId = $request->input('user_id');

        $exists = User::where('email', $email)
            ->when($userId, function ($query) use ($userId) {
                return $query->where('id', '!=', $userId);
            })
            ->exists();

        return response()->json([
            'available' => !$exists
        ]);
    }

    public function getExistingUsers()
    {
        try {
            $users = USER::select('id', 'firstname', 'email')->get();
            return response()->json($users);
        } catch (\Exception $e) {
            Log::error("Error fetching users: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch users'.$e->getMessage()], 500);
        }
    }

    // Duplicated function with PasswordResetLinkController hence removed - Vennise
    // public function sendResetLinkEmail(Request $request)
    // {
    //     try {
    //         $builder = new TemporaryEmailBuilder();
    //         $email = $builder
    //             ->setRecipient($request->email)
    //             ->buildEmail();

    //         // Store token in database
    //         DB::table('password_reset_tokens')->updateOrInsert(
    //             ['email' => $request->email],
    //             [
    //                 'token' => $builder->getToken(),
    //                 'created_at' => now(),
    //                 'expires_at' => $builder->getExpiresAt(),
    //                 'used' => false
    //             ]
    //         );

    //         Mail::send($email->getResult());

    //         return response()->json([
    //             'message' => 'Reset link sent successfully',
    //             'status' => 'success'
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send reset email: ' . $e->getMessage());
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }
}
