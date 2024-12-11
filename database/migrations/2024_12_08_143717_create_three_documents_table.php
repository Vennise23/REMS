<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('three_documents', function (Blueprint $table) {
            $table->id('unique_id'); // Primary key with auto-increment
            $table->unsignedBigInteger('property_id'); // Ensure this matches the type in the properties table
            $table->string('file_path'); // File path (string, not null)
            $table->string('file_name'); // File name (string, not null)
            $table->char('file_type', 10)->nullable(); // File type (char, optional, max 10 chars)
            $table->timestamp('create_date')->useCurrent(); // Creation date (defaults to current timestamp)
            $table->unsignedBigInteger('create_by')->nullable(); // Creator (references user ID)
            $table->timestamp('modified_date')->nullable()->useCurrentOnUpdate(); // Last modified date
            $table->unsignedBigInteger('modified_by')->nullable(); // Modifier (references user ID)
        
            // Add foreign key relationships
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('no action');
            $table->foreign('create_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('modified_by')->references('id')->on('users')->onDelete('set null');
        });
        
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('three_documents');
    }
};
