<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    // app/Http/Controllers/Auth/RegisteredUserController.php
    // app/Http/Controllers/Auth/RegisteredUserController.php

public function store(Request $request): RedirectResponse
{
    $request->validate([
        'firstname' => 'required|string|max:255',
        'lastname' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|confirmed|min:8',
        'ic_number' => 'required|string|max:255',
        'age' => 'required|integer',
        'born_date' => 'required|date',
        'phone' => 'required|string|max:255',
        'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        'address_line_1' => 'required|string|max:255',
        'address_line_2' => 'nullable|string|max:255',
        'city' => 'required|string|max:255',
        'postal_code' => 'required|string|max:10',
    ]);

    // Handle profile picture upload
    $profilePicturePath = null;
    if ($request->hasFile('profile_picture')) {
        $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
    }

    $user = User::create([
        'firstname' => $request->firstname,
        'lastname' => $request->lastname,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'ic_number' => $request->ic_number,
        'age' => $request->age,
        'born_date' => $request->born_date,
        'phone' => $request->phone,
        'profile_picture' => $profilePicturePath,
        'address_line_1' => $request->address_line_1,
        'address_line_2' => $request->address_line_2,
        'city' => $request->city,
        'postal_code' => $request->postal_code,
        'role' => 'user', // Default role for a user
    ]);

    event(new Registered($user));
    Auth::login($user);

    return redirect()->route('main'); // Redirect to main page
}


}
