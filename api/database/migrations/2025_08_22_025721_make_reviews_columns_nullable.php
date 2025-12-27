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
        Schema::table('reviews', function (Blueprint $table) {
            $table->integer('score_overall')->nullable()->change();
            $table->text('comments_to_authors')->nullable()->change();
            $table->text('comments_to_editors')->nullable()->change();
         
            $table->json('attachment_paths')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->integer('score_overall')->nullable(false)->change();
            $table->text('comments_to_authors')->nullable(false)->change();
            $table->text('comments_to_editors')->nullable(false)->change();
         
            $table->json('attachment_paths')->nullable(false)->change();
        });
    }
};
