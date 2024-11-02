<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function index()
    {
        try {
            $users = User::select('id', 'name', 'email', 'created_at', 'updated_at')->get();
            return response()->json($users);
        } catch (\Exception $e) {
            // Log::error("Error fetching users: " . $e->getMessage()); // Log the error message
            return response()->json(['error' => 'Unable to fetch users. Please check the server logs for more details.'], 500);
        }
    }

    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ]);

        // Create the new user with hashed password
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json($user);
    }


}
