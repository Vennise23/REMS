<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->index();
                $table->string('token');
                $table->boolean('used')->default(false);
                $table->timestamp('created_at')->nullable();
            });
        } else {
            Schema::table('password_reset_tokens', function (Blueprint $table) {
                if (!Schema::hasColumn('password_reset_tokens', 'used')) {
                    $table->boolean('used')->default(false);
                }
                if (!Schema::hasColumn('password_reset_tokens', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('password_reset_tokens')) {
            if (Schema::hasColumn('password_reset_tokens', 'used')) {
                Schema::table('password_reset_tokens', function (Blueprint $table) {
                    $table->dropColumn('used');
                });
            }
        }
    }
}; 