<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->enum('status', ['available', 'sold', 'rented', 'cancelled'])
                ->default('available');
            $table->unsignedBigInteger('buyer_id')->nullable();
            $table->timestamp('transaction_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->dropColumn('buyer_id');
            $table->dropColumn('transaction_date');
        });
    }
};
