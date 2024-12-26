<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;


class FileController extends Controller
{
    // Display the upload view
    public function showUploadForm(Request $request)
    {
        $bImages = $request->input('bImages');
        return Inertia::render('Three/UploadPlans', [
            'bImages' => [],
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    public function uploadFile(Request $request)
    {

        // Validate the uploaded file
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg|max:2048', // 2MB max
        ]);

        // Ensure the 'temp' directory exists in 'public'
        $uploadPath = public_path('storage/temp');
        if (!File::exists($uploadPath)) {
            File::makeDirectory($uploadPath, 0755, true);
        }

        // Generate a unique file name
        $file = $request->file('file');
        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)
            . '_' . uniqid()
            . '.' . $file->getClientOriginalExtension();
        try {
            // Save the file
            $file->move($uploadPath, $fileName);

            self::scheduleDelete();

            // Return the file path as a JSON response
            return response()->json([
                'message' => 'File uploaded successfully.',
                'fileName' => $fileName,
                'filePath' => asset('storage/temp/' . $fileName),
            ]);
        } catch (\Exception $e) {
            // Log the error for further inspection
            Log::error($e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    //Display Binarize Editor View 
    public function submitUploadForm(Request $request)
    {
        try {
            $data = $request->all();
    
            // Validate the input
            $validator = Validator::make($data, [
                'images' => 'required|array|min:1',
                'images.*.filename' => 'required|string',
                'images.*.filepath' => 'required|string',
                'images.*.threshold' => 'required|integer',
            ]);
    
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
    
            // Process the data
            $bImages = $data['images'];
            Session::put('bImages', $bImages);
    
            if ($request->expectsJson()) {
                // Return a JSON response for AJAX requests
                return response()->json([
                    'redirect' => route('binarize.show'),
                ]);
            }
    
            // Render the Inertia view for standard requests
            return Inertia::render('Three/Binarize', [
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function showBinarizeForm()
{
    // Retrieve the images data from the session
    $bImages = Session::get('bImages');
    
    // Pass it to the view
    return Inertia::render('Three/Binarize', [
        'bImages' => $bImages,
        'auth' => [
            'user' => auth()->user(),
        ],
    ]);
}

    public static function scheduleDelete()
    {
        Log::info("Cleaning Temp File...");

        $directory = public_path('storage/temp');
        $tempFiles = self::getFilesWithCreationDate($directory);
        $currentTime = now()->subHours(2);
        try {
            // Iterate through the tempFiles array
            foreach ($tempFiles as $file) {
                $fileName = $file['file_name'];
                $filePath = public_path('storage/temp/' . $fileName);
                $createdAt = Carbon::parse($file['created_at']);
                Log::info("Checking File Info:" . $filePath);

                // Check if file is older than 2 hours
                if ($createdAt->lte($currentTime)) {
                    if (File::exists($filePath)) {
                        File::delete($filePath);
                        Log::info("Deleted file: {$fileName}");
                    } else {
                        Log::error("File does not exist: {$filePath}");
                    }
                }
            }
        } catch (\Exception $e) {
            // Log the error for further inspection
            Log::error($e->getMessage());
        }
    }

    public static function getFilesWithCreationDate($directory)
    {
        // Ensure the directory exists
        if (!is_dir($directory)) {
            return [];
        }

        try {
            $files = [];
            $fileList = scandir($directory); // Get all files in the directory

            foreach ($fileList as $file) {
                // Skip . and .. entries
                if ($file == '.' || $file == '..') {
                    continue;
                }

                $filePath = $directory . DIRECTORY_SEPARATOR . $file;

                // Check if it's a file (not a directory)
                if (is_file($filePath)) {
                    // Add file and its creation date to the files array
                    $files[] = [
                        'file_name' => $file,
                        'created_at' => date("Y-m-d H:i:s", filectime($filePath)), // Get the file's creation date
                    ];
                }
            }
            return $files;
        } catch (\Exception $e) {
            // Log the error for further inspection
            Log::error($e->getMessage());
            return [];
        }
    }

    public function imageBinarization($file, $threshold)
    {
        // Convert image to grayscale
        imagefilter($file, IMG_FILTER_GRAYSCALE);

        // Apply threshold for binarization
        $width = imagesx($file);
        $height = imagesy($file);

        for ($x = 0; $x < $width; $x++) {
            for ($y = 0; $y < $height; $y++) {
                $rgb = imagecolorat($file, $x, $y);
                $colors = imagecolorsforindex($file, $rgb);

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

                $newColor = imagecolorallocate($file, $color, $color, $color);
                imagesetpixel($file, $x, $y, $newColor);
            }
        }

        // Save the binary image to a temporary path
        ob_start();
        imagepng($file);
        $binaryImage = ob_get_clean();
        imagedestroy($file);

        return $binaryImage;
    }
}
