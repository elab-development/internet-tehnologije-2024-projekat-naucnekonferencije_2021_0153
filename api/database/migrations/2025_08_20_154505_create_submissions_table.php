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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->morphs('submitable'); // submitable_id, submitable_type (Conference ili Issue)
            $table->string('title');
            $table->text('abstract')->nullable();
            $table->enum('status',[
                'submitted','in_review','revision_required',
                'accepted','rejected','camera_ready','published'
            ])->default('submitted');
            $table->foreignId('corresponding_author_id')->constrained('users')->cascadeOnDelete();

            // fajlovi direktno u istoj tabeli
            $table->string('manuscript_path');
            $table->json('supplementary_files')->nullable();
            $table->string('camera_ready_path')->nullable();

            // opcija za časopis
            $table->string('doi')->nullable();
            $table->string('pages')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->text('keywords')->nullable(); // ako ne praviš posebnu tabelu
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
        Schema::dropIfExists('submissions');
    }
};
