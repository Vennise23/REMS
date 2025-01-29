<?php

namespace App\Observers;

use App\Models\Property;
use Illuminate\Support\Facades\Log;

class PropertyObserver
{
    public function creating(Property $property)
    {
        Log::info('Property is being created: ', ['property' => $property]);
        $property->status = $property->status ?? 'available';
        $property->approval_status = $property->approval_status ?? 'pending';
    }

    public function created(Property $property)
    {
        Log::info('Property created: ' . $property->id);
    }

    public function updating(Property $property)
    {
        Log::info('Property is being updated: ', ['property' => $property]);
    }

    public function updated(Property $property)
    {
        Log::info("Property updated: " . $property->id);
    }

    public function deleting(Property $property)
    {
        Log::info('Property is being deleted: ', ['property' => $property]);

        if ($property->status === 'sold') {
            throw new \Exception("Cannot delete a sold property.");
        }
    }

    public function deleted(Property $property)
    {
        Log::info('Property deleted: ' . $property->id);
    }
}