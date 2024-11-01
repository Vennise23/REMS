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
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('relation_to_property', ['Owner', 'Board Member', 'Developer', 'Other']);
            $table->string('address_line_1');
            $table->string('address_line_2')->nullable();
            $table->string('city');
            $table->string('phone1');
            $table->string('phone2')->nullable();
            $table->string('fax')->nullable();
            $table->string('email');
            $table->string('heard_about_us')->nullable();
            
            // Property Information
            $table->string('property_name');
            $table->string('property_address_line_1');
            $table->string('property_address_line_2')->nullable();
            $table->string('property_city');
            $table->string('postal_code');
            $table->integer('number_of_units');
            $table->integer('total_commercial_units')->nullable();
            $table->integer('total_commercial_space_sqft')->nullable();
            $table->year('year_built')->nullable();
            $table->string('developer')->nullable();
            $table->string('condominium_plan_number')->nullable();
            $table->enum('property_type', ['Conventional Condominium', 'Bare Land Condominium', 'Commercial', 'Other / Not Sure']);
            $table->json('property_styles')->nullable(); // For multiple styles
            
            // Additional Information
            $table->boolean('each_unit_has_furnace')->nullable();
            $table->boolean('each_unit_has_electrical_meter')->nullable();
            $table->boolean('has_onsite_caretaker')->nullable();
            $table->enum('parking', ['Above ground', 'Underground', 'Both']);
            $table->json('amenities')->nullable(); // For multiple amenities
            $table->string('other_amenities')->nullable();
            $table->text('additional_info')->nullable();

            $table->string('image_path')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
