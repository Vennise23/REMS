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
            $table->string('property_title');
            $table->enum('property_type', ['Conventional Condominium', 'Bare Land Condominium', 'Commercial', 'Other / Not Sure']);
            $table->string('property_address_line_1');
            $table->string('property_address_line_2')->nullable();
            $table->string('property_city');
            $table->string('property_postal_code');
            $table->integer('number_of_units');
            $table->integer('total_commercial_units')->nullable();
            $table->integer('total_commercial_space_sqft')->nullable();
            $table->year('year_built')->nullable();
            $table->string('developer')->nullable();
            $table->string('certificate_number')->nullable();
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

            $table->timestamps();

        });
    }

    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
