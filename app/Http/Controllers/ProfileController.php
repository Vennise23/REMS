<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;



use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit()
    {
        // Get the authenticated user's data
        $user = Auth::user();

        // Render the profile view with user data
        return Inertia::render('Profile', [
            'user' => $user
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . auth()->id(),
                'ic_number' => 'required|string|max:255|unique:users,ic_number,' . auth()->id(),
                'phone' => 'nullable|string|max:255',
                'gender' => 'nullable|string|in:male,female,other',
                'born_date' => 'nullable|date',
                'age' => 'nullable|integer',
                'address_line_1' => 'nullable|string|max:255',
                'address_line_2' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:255',
                'profile_picture' => 'nullable|image|max:2048', // 2MB max
            ]);

            $user = User::find(auth()->id());

            if (!$user) {
                throw new \Exception('User not found');
            }

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                $path = $request->file('profile_picture')->store('profile_pictures', 'public');
                $validated['profile_picture'] = $path;
            }

            // Update user attributes individually
            foreach ($validated as $key => $value) {
                $user->$key = $value;
            }
            
            $user->save();

            return redirect()->back()->with('success', 'Profile updated successfully');

        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'An error occurred while saving your profile'])
                ->withInput();
        }
    }


    /**
     *
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function checkName(Request $request)
    {
        $firstname = $request->input('firstname');
        $lastname = $request->input('lastname');

        // Check if firstname and lastname already exist in the database
        $exists = User::where('firstname', $firstname)
            ->where('lastname', $lastname)
            ->exists();

        if ($exists) {
            return response()->json([
                'errors' => [
                    'nameExists' => 'The combination of first name and last name is already registered. Please use a different name.',
                ]
            ], 422);
        }

        return response()->json(['success' => true]);
    }

    public function checkEmail(Request $request)
    {
        $exists = User::where('email', $request->email)
                      ->where('id', '!=', auth()->id()) // Exclude current user
                      ->exists();
        return response()->json(['exists' => $exists]);
    }

    public function checkIC(Request $request)
    {
        $exists = User::where('ic_number', $request->ic_number)
                      ->where('id', '!=', auth()->id()) // Exclude current user
                      ->exists();
        return response()->json(['exists' => $exists]);
    }
}
