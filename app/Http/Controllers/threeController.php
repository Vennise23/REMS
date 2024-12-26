<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

class threeController extends Controller
{
    // Display the upload view
    public function showUploadForm()
    {
        // Render the profile view with user data
        return Inertia::render('Three/UploadImage', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    // Handle when new image uploaded
    public function handleUpload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max size 2MB
        ]);

        $image = $request->file('image');
        $threshold = $request->input('threshold', 127); // Default to 127 if not provided

        // Ensure the 'temp' directory exists in 'public'
        $uploadPath = public_path('temp');
        if (!File::exists($uploadPath)) {
            File::makeDirectory($uploadPath, 0755, true);
        }
        try {
            // Process image binary conversion using the threshold and save temporarily
            $imageResource = imagecreatefromstring(file_get_contents($image->getRealPath()));
            if (!$imageResource) {
                throw new \Exception('Invalid image file.');
            }
            $binarizedImage = $this->imageBinarization($imageResource, $threshold);

            $binarizedImageName = 'binarized_' . time() . '.png';
            $binarizedImagePath = 'temp/' . $binarizedImageName;
            file_put_contents($binarizedImagePath, $binarizedImage);

            // Save the original image temporarily
            $originalImageName = 'original_' . time() . '.' . $image->getClientOriginalExtension();
            $originalImagePath = 'temp/' . $originalImageName;
            $image->move($uploadPath, $originalImageName);

            // Redirect to a result page.
            return Inertia::render('Three/UploadResult', [
                'originalImagePath' => asset($originalImagePath),
                'binarizedImagePath' => asset($binarizedImagePath),
                'originalThreShold' => 0,
                'binarizedThreShold' => 127,
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            // Handle errors and redirect back with error message
            return redirect()->back()->withErrors(['message' => 'An error occurred: ' . $e->getMessage()]);
        }
    }

    //Handle on saving result in UploadResult.jsx
    public function saveUploadFiles(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'threshold' => 'required|integer|min:0|max:255',
            'imagePath' => 'required|string',
            'originalImagePath' => 'required|string',
            'binarizedImagePath' => 'required|string',
            'propertyID' => 'required|string',
        ]);

        // Get data from the request
        $threshold = $request->input('threshold');
        $imagePath = $request->input('imagePath');
        $originalImagePath = $request->input('originalImagePath');
        $binarizedImagePath = $request->input('binarizedImagePath');
        $propertyId = $request->input('propertyID');

        // Validate that files exist
        if (!File::exists($originalImagePath) || !File::exists($binarizedImagePath)) {
            return redirect()->back()->withErrors(['message' => 'Image files do not exist.']);
        }

        try {
            // Get the authenticated user
            $user = auth()->user();
            $username = $user->username;

            // Create the 'uploads' directory if it doesn't exist
            $uploadPath = public_path('uploads');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }

            // Generate unique filenames
            $timestamp = now()->timestamp;
            $fileNumber = uniqid();
            $imageFileName = "{$username}_{$propertyId}_{$fileNumber}_{$timestamp}_binarized.png";

            // Move the files to the 'uploads' directory
            File::move($imagePath,  'uploads/' . $imageFileName);

            // Delete temporary files
            File::delete($originalImagePath);
            File::delete($binarizedImagePath);

            // Redirect to the upload page with success message
            return redirect()->route('three.upload')->with('success', 'Files saved successfully.');
        } catch (\Exception $e) {
            // Handle errors and redirect back with error message
            return redirect()->back()->withErrors(['message' => 'An error occurred: ' . $e->getMessage()]);
        }
    }

    // Perform image binarization using GD library.
    private function imageBinarization($imageResource, $threshold)
    {
        // Convert image to grayscale
        imagefilter($imageResource, IMG_FILTER_GRAYSCALE);

        // Apply threshold for binarization
        $width = imagesx($imageResource);
        $height = imagesy($imageResource);

        for ($x = 0; $x < $width; $x++) {
            for ($y = 0; $y < $height; $y++) {
                $rgb = imagecolorat($imageResource, $x, $y);
                $colors = imagecolorsforindex($imageResource, $rgb);

                // Calculate the intensity (average of RGB)
                $intensity = ($colors['red'] + $colors['green'] + $colors['blue']) / 3;

                // Dynamically adjust the threshold for dark lines
                if ($intensity < 50) {
                    // Force dark lines to black
                    $color = 0;
                } else {
                    // Apply the provided threshold for other pixels
                    $color = $intensity > $threshold ? 255 : 0;
                }

                $newColor = imagecolorallocate($imageResource, $color, $color, $color);
                imagesetpixel($imageResource, $x, $y, $newColor);
            }
        }

        // Save the binary image to a temporary path
        ob_start();
        imagepng($imageResource);
        $binaryImage = ob_get_clean();
        imagedestroy($imageResource);

        return $binaryImage;
    }
}