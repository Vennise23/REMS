<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class NewLaunchController extends Controller
{
    public function index()
    {
        $query = Property::query();
        $query->where('approval_status','Approved');
        
        return Inertia::render('NewLaunches/Index', [
            'auth' => ['user' => auth()->user()]
        ]);
    }

    public function getNewLaunches(Request $request)
    {
        try {
            $query = Property::query()
                ->whereDate('created_at', '>=', Carbon::now()->subMonth())
                ->where(function($q) {
                    $q->where('status', 'available')
                      ->orWhere('status', 'sold')
                      ->orWhere('status', 'rented');
                })  // 只显示可用、已售和已租的房产
                ->where('approval_status','Approved')
                ->with(['user']);

            // Purchase Type 筛选
            if ($request->filled('purchase')) {
                if ($request->purchase !== 'All Properties') {
                    $query->where('purchase', $request->purchase);
                }
            }

            // Status 筛选 - 修改为只允许筛选这些状态
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', function($q) use ($request) {
                    if ($request->status === 'available') {
                        return 'available';
                    } elseif ($request->status === 'sold') {
                        return 'sold';
                    } elseif ($request->status === 'rented') {
                        return 'rented';
                    }
                });
            }

            // 2. Property Type 筛选
            if ($request->filled('propertyType') && $request->propertyType !== 'All Property') {
                $query->where('property_type', $request->propertyType);
            }

            // 3. Sale Type 筛选
            if ($request->filled('saleType') && $request->saleType !== 'All Types') {
                $query->where('sale_type', $request->saleType);
            }

            // 4. 价格范围筛选
            if ($request->filled('priceMin')) {
                $query->where('price', '>=', (float)$request->priceMin);
            }
            if ($request->filled('priceMax')) {
                $query->where('price', '<=', (float)$request->priceMax);
            }

            // 5. 面积筛选
            if ($request->filled('sizeMin')) {
                $query->where('square_feet', '>=', (int)$request->sizeMin);
            }
            if ($request->filled('sizeMax')) {
                $query->where('square_feet', '<=', (int)$request->sizeMax);
            }

            // 6. 城市筛选
            if ($request->filled('citySearch')) {
                $query->where('city', 'like', '%' . $request->citySearch . '%');
            }

            // 7. 设施筛选
            if ($request->filled('amenities') && !empty($request->amenities)) {
                $amenities = is_array($request->amenities) 
                    ? $request->amenities 
                    : json_decode($request->amenities, true);

                if (!empty($amenities)) {
                    foreach ($amenities as $amenity) {
                        $query->whereJsonContains('amenities', $amenity);
                    }
                }
            }

            // 记录每个筛选步骤的结果
            \Log::info('Filter conditions:', [
                'property_type' => $request->propertyType,
                'sale_type' => $request->saleType,
                'price_range' => [$request->priceMin, $request->priceMax],
                'size_range' => [$request->sizeMin, $request->sizeMax],
                'city' => $request->citySearch,
                'amenities' => $request->amenities
            ]);

            // 排序
            $sortDirection = $request->input('sortDirection', 'desc');
            $query->orderBy('created_at', $sortDirection);

            // 获取分页数据
            $properties = $query->paginate(6);

            // 转换数据格式
            $properties->getCollection()->transform(function ($property) {
                $property->formatted_date = Carbon::parse($property->created_at)->format('M d, Y');
                if ($property->property_photos) {
                    $property->property_photos = collect($property->property_photos)->map(function ($photo) {
                        return url('storage/' . $photo);
                    });
                }
                // 添加状态相关信息
                $property->status_info = [
                    'is_available' => $property->status === 'available',
                    'status_text' => ucfirst($property->status),
                    'transaction_date' => $property->transaction_date ? Carbon::parse($property->transaction_date)->format('M d, Y') : null,
                ];
                return $property;
            });

            return response()->json($properties);
            
        } catch (\Exception $e) {
            \Log::error('Error in getNewLaunches:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch properties',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 