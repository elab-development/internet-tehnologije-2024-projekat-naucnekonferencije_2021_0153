<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Conference;
use App\Models\TicketType;
use App\Models\Registration;
use App\Models\Submission;
use App\Models\ReviewerAssignment;
use App\Models\Review;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // isključimo foreign key constraints
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        Review::truncate();
        ReviewerAssignment::truncate();
        Submission::truncate();
        Registration::truncate();
        TicketType::truncate();
        Conference::truncate();
        User::truncate();
        DB::table('submission_user')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ---- USERS ----
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'affiliation' => 'Org University',
        ]);

        $author1 = User::create([
            'name' => 'Author One',
            'email' => 'author@example.com',
            'password' => bcrypt('password'),
            'role' => 'author',
            'affiliation' => 'Science Faculty',
        ]);
        $author2 = User::create([
            'name' => 'Author Two',
            'email' => 'author2@example.com',
            'password' => bcrypt('password'),
            'role' => 'author',
            'affiliation' => 'Tech Faculty',
        ]);

        $reviewer1 = User::create([
            'name' => 'Reviewer One',
            'email' => 'reviewer@example.com',
            'password' => bcrypt('password'),
            'role' => 'reviewer',
            'affiliation' => 'Tech Institute',
        ]);
        $reviewer2 = User::create([
            'name' => 'Reviewer Two',
            'email' => 'reviewer2@example.com',
            'password' => bcrypt('password'),
            'role' => 'reviewer',
            'affiliation' => 'BioTech Lab',
        ]);

        $attendee = User::create([
            'name' => 'Ana Marković',
            'email' => 'ana@fon.bg.ac.rs',
            'password' => bcrypt('password'),
            'role' => 'attendee',
            'affiliation' => 'FON',
        ]);

        // ---- CONFERENCES ----
        $conf1 = Conference::create([
            'title' => 'International AI Conference',
            'acronym' => 'AICONF',
            'location' => 'Belgrade',
            'start_date' => '2025-09-01',
            'end_date' => '2025-09-03',
            'status' => 'published',
            'description' => 'Conference about AI and ML',
            'max_capacity' => 300,
            'program_json' => [
                ['day' => '2025-09-01', 'start' => '09:00', 'end' => '10:00', 'room' => 'Main Hall', 'title' => 'Opening Keynote', 'speaker' => 'Prof. X', 'type' => 'keynote']
            ]
        ]);

        $conf2 = Conference::create([
            'title' => 'Data Science Summit',
            'acronym' => 'DSS',
            'location' => 'Novi Sad',
            'start_date' => '2025-10-15',
            'end_date' => '2025-10-17',
            'status' => 'draft',
            'description' => 'Latest trends in Data Science and Big Data',
            'max_capacity' => 200,
            'program_json' => [],
        ]);

        // ---- TICKETS ----
        $ticket1 = TicketType::create([
            'conference_id' => $conf1->id,
            'name' => 'Early Bird',
            'price' => 50.00,
            'currency' => 'EUR',
            'sales_start' => '2025-06-01',
            'sales_end' => '2025-07-31',
            'quota' => 100
        ]);
        $ticket2 = TicketType::create([
            'conference_id' => $conf1->id,
            'name' => 'Regular',
            'price' => 80.00,
            'currency' => 'EUR',
            'sales_start' => '2025-08-01',
            'sales_end' => '2025-09-01',
            'quota' => 150
        ]);

        $ticket3 = TicketType::create([
            'conference_id' => $conf2->id,
            'name' => 'Standard',
            'price' => 60.00,
            'currency' => 'EUR',
            'sales_start' => '2025-07-01',
            'sales_end' => '2025-10-10',
            'quota' => 120
        ]);

        // ---- REGISTRATIONS ----
        Registration::create([
            'conference_id' => $conf1->id,
            'user_id' => $author1->id,
            'ticket_type_id' => $ticket1->id,
            'status' => 'confirmed',
            'paid_at' => now(),
        ]);

        Registration::create([
            'conference_id' => $conf1->id,
            'user_id' => $attendee->id,
            'ticket_type_id' => $ticket2->id,
            'status' => 'pending',
        ]);

        // ---- SUBMISSION ----
        $submission1 = Submission::create([
            'submitable_type' => Conference::class,
            'submitable_id' => $conf1->id,
            'title' => 'Deep Learning for Healthcare',
            'abstract' => 'This paper explores DL in healthcare.',
            'status' => 'submitted',
            'corresponding_author_id' => $author1->id,
            'manuscript_path' => 'papers/deep_learning.pdf',
            'supplementary_files' => ['papers/appendix.pdf'],
        ]);
        $submission1->authors()->attach($author1->id, [
            'author_order' => 1,
            'is_corresponding' => true,
        ]);

        // ---- REVIEW ----
        $assignment = ReviewerAssignment::create([
            'submission_id' => $submission1->id,
            'reviewer_id' => $reviewer1->id,
            'invited_at' => now(),
            'due_at' => now()->addDays(14),
        ]);

        Review::create([
            'submission_id' => $submission1->id,
            'reviewer_id' => $reviewer1->id,
            'recommendation' => 'accept',
            'score_overall' => 90,
            'comments_to_authors' => 'Excellent work!',
            'comments_to_editors' => 'Recommend acceptance.',
            'submitted_at' => now(),
        ]);
    }
}
