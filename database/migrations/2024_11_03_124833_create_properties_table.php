<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();

            // User Information (nullable for now)
            $table->unsignedBigInteger('user_id')->nullable(); // Nullable user_id for now
            $table->string('username')->nullable(); // Nullable username for now

            // Property Information
            $table->string('property_name');
            $table->string('property_address_line_1');
            $table->string('property_address_line_2')->nullable();
            $table->string('city');
            $table->string('postal_code');
            $table->string('state')->nullable();
            $table->enum('purchase', ['For Sale', 'For Rent']);
            $table->enum('sale_type', ['New Launch', 'Subsale'])->nullable();
            $table->enum('property_type', ['Conventional Condominium', 'Bare Land Condominium', 'Commercial']);
            $table->integer('number_of_units');
            $table->integer('square_feet');
            $table->decimal('price', 10, 2);
            $table->json('certificate_photos')->nullable();
            $table->json('property_photos')->nullable();
            
            // Additional Information
            $table->boolean('each_unit_has_furnace')->nullable();
            $table->boolean('each_unit_has_electrical_meter')->nullable();
            $table->boolean('has_onsite_caretaker')->nullable();
            $table->enum('parking', ['Above ground', 'Underground', 'Both'])->nullable();
            $table->json('amenities')->nullable();
            $table->string('other_amenities')->nullable();
            $table->text('additional_info')->nullable();

            // Status
            $table->enum('approval_status', ['Pending', 'Approved', 'Rejected'])->default('Pending');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
