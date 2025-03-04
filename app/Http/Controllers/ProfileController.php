<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        try {
            $user = User::findOrFail(auth()->id());
            
            $rules = [
                'firstname' => 'nullable|string|min:2',
                'lastname' => 'nullable|string|min:2',
                'email' => [
                    'nullable',
                    'email',
                    Rule::unique('users')->ignore($user->id),
                ],
                'ic_number' => [
                    'nullable',
                    'string',
                    Rule::unique('users')->ignore($user->id),
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
            $data = $validator->validated();

            if ($request->hasFile('profile_picture')) {
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $path = $request->file('profile_picture')->store('profile_pictures', 'public');
                $data['profile_picture'] = $path;
            }

            $data = array_filter($data, function ($value) {
                return $value !== null;
            });

            $user->fill($data)->save();

            return redirect()->back()->with('success', 'Profile updated successfully');

        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage());
            return back()->with('error', 'Error updating profile');
        }
    }

    public function update(Request $request)
    {
        try {
            $user = User::findOrFail(auth()->id());
            
            $rules = [
                'firstname' => 'nullable|string|min:2',
                'lastname' => 'nullable|string|min:2',
                'email' => [
                    'nullable',
                    'email',
                    Rule::unique('users')->ignore($user->id),
                ],
                'ic_number' => [
                    'nullable',
                    'string',
                    Rule::unique('users')->ignore($user->id),
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
            $data = $validator->validated();

            if ($request->hasFile('profile_picture')) {
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $path = $request->file('profile_picture')->store('profile_pictures', 'public');
                $data['profile_picture'] = $path;
            }

            $data = array_filter($data, function ($value) {
                return $value !== null;
            });

            $user->fill($data)->save();

            return redirect()->back()->with('success', 'Profile updated successfully');

        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage());
            return back()->with('error', 'Error updating profile');
        }
    }

    public function checkName(Request $request)
    {
        $exists = User::where('firstname', $request->firstname)
                     ->where('lastname', $request->lastname)
                     ->where('id', '!=', auth()->id())
                     ->exists();

        return response()->json(['exists' => $exists]);
    }

    public function checkEmail(Request $request)
    {
        $exists = User::where('email', $request->email)
                     ->where('id', '!=', auth()->id())
                     ->exists();

        return response()->json(['exists' => $exists]);
    }

    public function checkIC(Request $request)
    {
        $exists = User::where('ic_number', $request->ic_number)
                     ->where('id', '!=', auth()->id())
                     ->exists();

        return response()->json(['exists' => $exists]);
    }

    public function show()
    {
        return Inertia::render('Profile/ProfileForm', [
            'user' => auth()->user()
        ]);
    }
}
