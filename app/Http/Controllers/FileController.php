<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

class FileController extends Controller
{
    public function uploadFile(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg|max:2048', // 2MB max
        ]);

        // Ensure the 'temp' directory exists in 'public'
        $uploadPath = public_path('temp');
        if (!File::exists($uploadPath)) {
            File::makeDirectory($uploadPath, 0755, true);
        }

        // Store the file temporarily
        $path = $request->file('file')->store('temp', 'public');

        // Return the file path as a JSON response
        return response()->json([
            'message' => 'File uploaded successfully.',
            'filePath' => asset('storage/' . $path),
        ]);
    }
}
