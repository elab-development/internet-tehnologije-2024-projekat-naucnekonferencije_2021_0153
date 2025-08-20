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
        Schema::table('issues', function (Blueprint $table) {
            $table->string('volume')->nullable()->change();
            $table->string('number')->nullable()->change();
            $table->string('year')->nullable()->change();
            $table->string('special_issue_title')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('issues', function (Blueprint $table) {
             $table->string('volume')->nullable(false)->change();
            $table->string('number')->nullable(false)->change();
            $table->string('year')->nullable(false)->change();
            $table->string('special_issue_title')->nullable(false)->change();
        });
    }
};
