<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ValidationController extends Controller
{
    public function checkNameAvailability(Request $request)
    {
        $exists = User::where('firstname', $request->firstname)
                     ->where('lastname', $request->lastname)
                     ->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This name combination is already registered' : null
        ]);
    }

    public function checkEmailAvailability(Request $request)
    {
        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This email is already registered' : null
        ]);
    }
}