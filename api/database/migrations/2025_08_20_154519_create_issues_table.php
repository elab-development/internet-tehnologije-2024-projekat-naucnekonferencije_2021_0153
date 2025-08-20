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
        Schema::create('issues', function (Blueprint $table) {
             $table->id();
            $table->foreignId('journal_id')->constrained()->cascadeOnDelete();
            $table->string('volume');
            $table->string('number');
            $table->string('year');
            $table->string('special_issue_title');
            $table->enum('status',['open','in_review','published'])->default('open');
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
        Schema::dropIfExists('issues');
    }
};
