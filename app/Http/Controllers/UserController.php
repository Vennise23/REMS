<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Import the Log facade
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use App\Events\UserStatusUpdated;
use App\Models\UserStatus;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;  // Add this at the top with other imports
use App\Mail\WelcomeEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;  // Add this with other imports
use Illuminate\Support\Facades\Password;
use Carbon\Carbon;
use App\Notifications\ResetPasswordNotification;

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
                'postal_code',
                'gender'
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
                'role' => 'required|in:user,admin',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Generate random temporary password
            $temporaryPassword = Str::random(12);

            // Handle profile picture upload
            $profile_picture_path = null;
            if ($request->hasFile('profile_picture')) {
                $profile_picture_path = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            // Create the user with temporary password
            $user = User::create([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'email' => $request->email,
                'password' => Hash::make($temporaryPassword), // Use temporary password
                'phone' => $request->phone,
                'ic_number' => $request->ic_number,
                'age' => $request->age,
                'born_date' => $request->born_date,
                'gender' => $request->gender,
                'address_line_1' => $request->address_line_1,
                'address_line_2' => $request->address_line_2,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'role' => $request->role,
                'profile_picture' => $profile_picture_path
            ]);

            // Create a password reset token
            $token = Str::random(64);
            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => $token,
                'created_at' => now(),
                'used' => false
            ]);

            // Send welcome email with temporary password
            Mail::to($user->email)->send(new WelcomeEmail(
                $user->firstname,
                $user->lastname,
                $user->email,
                $temporaryPassword, // Pass temporary password
                $token
            ));

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

    public function sendWelcomeEmail(Request $request)
    {
        try {
            Log::info('Received email request', [
                'email' => $request->email,
                'firstname' => $request->firstname
            ]);

            // Validate the incoming request
            $request->validate([
                'email' => 'required|email',
                'firstname' => 'required',
                'lastname' => 'required',
                'password' => 'required'
            ]);

            // Attempt to send email
            Mail::to($request->email)->send(new WelcomeEmail(
                $request->firstname,
                $request->lastname,
                $request->email,
                $request->password,
                $request->resetLink
            ));

            Log::info('Welcome email sent successfully to: ' . $request->email);

            return response()->json([
                'message' => 'Welcome email sent successfully',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to send welcome email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return Inertia::render('Auth/ForgotPassword', [
                    'status' => 'User not found'
                ])->withViewData(['error' => 'User not found']);
            }

            // Generate new token
            $token = Str::random(64);

            // Update or insert new token
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'email' => $request->email,
                    'token' => $token,
                    'created_at' => Carbon::now(),
                    'used' => false
                ]
            );

            // Send notification with new token
            $user->notify(new ResetPasswordNotification($token));

            // Return to the forgot password page with a success message
            return Inertia::render('Auth/ForgotPassword', [
                'status' => 'Password reset link sent successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Reset link error: ' . $e->getMessage());
            return Inertia::render('Auth/ForgotPassword', [
                'status' => 'Error sending reset link'
            ])->withViewData(['error' => $e->getMessage()]);
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
    public function updateStatus(Request $request)
    {
        try {
            $online = $request->boolean('online');
            $location = $request->location;

            // 更新状态
            $status = UserStatus::updateOrCreate(
                ['user_id' => auth()->id()],
                [
                    'is_online' => $online,
                    'location' => $online ? $location : null,
                    'last_activity' => $online ? now() : null
                ]
            );

            // 获取所有相关的聊天室
            $chatRooms = \App\Models\ChatRoom::where('buyer_id', auth()->id())
                ->orWhere('seller_id', auth()->id())
                ->get();

            // 广播状态更新给所有相关用户（移除 toOthers）
            foreach ($chatRooms as $room) {
                $otherUserId = $room->buyer_id === auth()->id() ? $room->seller_id : $room->buyer_id;
                broadcast(new UserStatusUpdated($otherUserId, [
                    'online' => $online,
                    'location' => $online ? $location : null
                ])); // 移除 toOthers() 以确保双向通知
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('Error in updateStatus: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUserStatus($userId)
    {
        try {
            $status = UserStatus::where('user_id', $userId)->first();

            // 如果没有状态记录，直接返回离线
            if (!$status) {
                return response()->json([
                    'online' => false,
                    'location' => null
                ]);
            }

            // 如果明确标记为离线，直接返回离线状态
            if (!$status->is_online || !$status->last_activity) {
                return response()->json([
                    'online' => false,
                    'location' => null
                ]);
            }

            // 检查最后活动时间是否在30秒内
            $isActive = $status->last_activity > now()->subSeconds(30);

            if (!$isActive) {
                // 如果不活跃，更新为离线状态
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
            \Log::error('Error getting user status: ' . $e->getMessage());
            return response()->json([
                'online' => false,
                'location' => null
            ]);
        }
    }
}
