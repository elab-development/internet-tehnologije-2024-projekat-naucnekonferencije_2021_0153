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
        Schema::create('reviews', function (Blueprint $table) {
             $table->id();
            $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->enum('recommendation',['accept','minor','major','reject'])->nullable();
            $table->integer('score')->nullable();
            $table->text('comments_to_authors')->nullable();
            $table->text('comments_to_editors')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->json('attachment_paths')->nullable(); // recenzentovi fajlovi
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reviews');
    }
};
