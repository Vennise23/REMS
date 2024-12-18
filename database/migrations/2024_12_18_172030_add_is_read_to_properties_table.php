
是的，您需要通过迁移（migration）为 properties 表添加 isRead 列。这个列将用于存储每个通知是否已被读取。

1. 创建新的迁移文件
首先，在您的 Laravel 项目中运行以下 Artisan 命令来创建一个新的迁移文件：

bash
Copy code
php artisan make:migration add_is_read_to_properties_table --table=properties
这将生成一个新的迁移文件，您可以在其中添加 isRead 列。

2. 更新迁移文件
打开生成的迁移文件，并在 up() 方法中添加 isRead 列。这里我们将其设置为布尔类型，默认值为 false（表示默认未读）。迁移文件的内容应该像这样：

php
Copy code
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsReadToPropertiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('properties', function (Blueprint $table) {
            // 添加 is_read 列，默认值为 false
            $table->boolean('is_read')->default(false)->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('properties', function (Blueprint $table) {
            // 删除 is_read 列
            $table->dropColumn('is_read');
        });
    }
}