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
        $user = Auth::user();

        $request->validate([
            'firstname' => 'string|max:255',
            'lastname' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $user->id,
            'ic_number' => 'nullable|string',
            'age' => 'nullable|integer',
            'born_date' => 'nullable|date',
            'phone' => 'nullable|string',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'password' => 'nullable|min:8|confirmed'
        ]);

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            $filePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $filePath;
        }

        $user->firstname = $request->firstname ?? $user->firstname;
        $user->lastname = $request->lastname ?? $user->lastname;
        $user->email = $request->email ?? $user->email;
        $user->ic_number = $request->ic_number ?? $user->ic_number;
        $user->age = $request->age ?? $user->age;
        $user->born_date = $request->born_date ?? $user->born_date;
        $user->phone = $request->phone ?? $user->phone;
        $user->address_line_1 = $request->address_line_1 ?? $user->address_line_1;
        $user->address_line_2 = $request->address_line_2 ?? $user->address_line_2;
        $user->city = $request->city ?? $user->city;
        $user->postal_code = $request->postal_code ?? $user->postal_code;

        $user->save();

        return redirect()->route('profile')->with('status', 'Profile updated successfully!');
    }

    /**
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
}
