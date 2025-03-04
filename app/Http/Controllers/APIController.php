<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class APIController extends Controller
{
    function getAddress(Request $request)
    {
        $query = $request->query('q');
        $response = Http::withHeaders([
            'User-Agent' => 'MyApp/1.0 (vviamwho02@gmail.com)' // Use your real email
        ])->get("https://nominatim.openstreetmap.org/search", [
            'format' => 'json',
            'q' => $query
        ]);

        return $response->json();
    }
}
