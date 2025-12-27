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

        /* ===========================
         * Users
         * =========================== */
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

        /* ===========================
         * Conferences (5 kom)
         * =========================== */

        // 1) AI konf.
        $conf1 = Conference::create([
            'title'       => 'International AI Conference',
            'acronym'     => 'AICONF',
            'location'    => 'Belgrade',
            'start_date'  => '2025-09-01',
            'end_date'    => '2025-09-03',
            'status'      => 'published',
            'description' => 'Conference about AI and ML',
            'max_capacity'=> 300,
            'program_json'=> [
                ['day'=>'2025-09-01','start'=>'09:00','end'=>'10:00','room'=>'Main Hall','title'=>'Opening Keynote','speaker'=>'Prof. X','type'=>'keynote'],
                ['day'=>'2025-09-01','start'=>'10:30','end'=>'12:00','room'=>'A1','title'=>'DL in Healthcare','speaker'=>'A. Smith','type'=>'talk'],
                ['day'=>'2025-09-02','start'=>'09:30','end'=>'11:00','room'=>'A2','title'=>'Panel: AI & Ethics','speaker'=>'Panel','type'=>'panel'],
            ]
        ]);

        // 2) Data Science Summit
        $conf2 = Conference::create([
            'title'       => 'Data Science Summit',
            'acronym'     => 'DSS',
            'location'    => 'Novi Sad',
            'start_date'  => '2025-10-15',
            'end_date'    => '2025-10-17',
            'status'      => 'draft',
            'description' => 'Latest trends in Data Science and Big Data',
            'max_capacity'=> 200,
            'program_json'=> [
                ['day'=>'2025-10-15','start'=>'09:00','end'=>'10:00','room'=>'Main','title'=>'State of DS 2025','speaker'=>'Dr. J. Doe','type'=>'keynote'],
                ['day'=>'2025-10-15','start'=>'10:15','end'=>'11:45','room'=>'Track 1','title'=>'MLOps in practice','speaker'=>'S. Petrović','type'=>'workshop'],
                ['day'=>'2025-10-16','start'=>'14:00','end'=>'16:00','room'=>'Track 2','title'=>'Big Data Systems','speaker'=>'Various','type'=>'session'],
            ],
        ]);

        // 3) Cyber Security Expo
        $conf3 = Conference::create([
            'title'       => 'Cyber Security Expo',
            'acronym'     => 'CSE',
            'location'    => 'Niš',
            'start_date'  => '2025-11-10',
            'end_date'    => '2025-11-12',
            'status'      => 'published',
            'description' => 'Security, privacy and cryptography.',
            'max_capacity'=> 250,
            'program_json'=> [
                ['day'=>'2025-11-10','start'=>'09:00','end'=>'09:45','room'=>'Hall 1','title'=>'Modern Threats','speaker'=>'L. Novak','type'=>'keynote'],
                ['day'=>'2025-11-11','start'=>'11:00','end'=>'12:30','room'=>'Lab','title'=>'Hands-on: Pentesting','speaker'=>'Team CSE','type'=>'workshop'],
                ['day'=>'2025-11-12','start'=>'13:00','end'=>'14:30','room'=>'Hall 2','title'=>'Zero Trust Architectures','speaker'=>'M. Ilić','type'=>'talk'],
            ],
        ]);

        // 4) Web Engineering Conference
        $conf4 = Conference::create([
            'title'       => 'Web Engineering Conference',
            'acronym'     => 'WEBENG',
            'location'    => 'Kragujevac',
            'start_date'  => '2025-06-05',
            'end_date'    => '2025-06-07',
            'status'      => 'published',
            'description' => 'Modern web frameworks, performance and DX.',
            'max_capacity'=> 180,
            'program_json'=> [
                ['day'=>'2025-06-05','start'=>'10:00','end'=>'11:00','room'=>'Main','title'=>'The Future of Web','speaker'=>'T. Ristić','type'=>'keynote'],
                ['day'=>'2025-06-06','start'=>'09:30','end'=>'11:00','room'=>'Track A','title'=>'SSR & Islands','speaker'=>'Various','type'=>'session'],
                ['day'=>'2025-06-07','start'=>'12:00','end'=>'13:00','room'=>'Workshop','title'=>'Web Perf Clinic','speaker'=>'Perf Crew','type'=>'workshop'],
            ],
        ]);

        // 5) Bioinformatics & HealthTech
        $conf5 = Conference::create([
            'title'       => 'Bioinformatics & HealthTech',
            'acronym'     => 'BIOHT',
            'location'    => 'Subotica',
            'start_date'  => '2025-12-01',
            'end_date'    => '2025-12-03',
            'status'      => 'draft',
            'description' => 'Computation in biology and digital health.',
            'max_capacity'=> 220,
            'program_json'=> [
                ['day'=>'2025-12-01','start'=>'09:15','end'=>'10:00','room'=>'Main','title'=>'Genomics at Scale','speaker'=>'Dr. K. Wang','type'=>'keynote'],
                ['day'=>'2025-12-02','start'=>'10:00','end'=>'11:30','room'=>'Hall B','title'=>'AI for Diagnostics','speaker'=>'Panel','type'=>'panel'],
                ['day'=>'2025-12-03','start'=>'14:00','end'=>'15:30','room'=>'Lab 2','title'=>'Workshop: Pipelines','speaker'=>'BIOHT Team','type'=>'workshop'],
            ],
        ]);

        /* ===========================
         * Ticket types
         * =========================== */
        // AICONF
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

        // DSS
        $ticket3 = TicketType::create([
            'conference_id' => $conf2->id,
            'name' => 'Standard',
            'price' => 60.00,
            'currency' => 'EUR',
            'sales_start' => '2025-07-01',
            'sales_end' => '2025-10-10',
            'quota' => 120
        ]);
        $ticket4 = TicketType::create([
            'conference_id' => $conf2->id,
            'name' => 'Student',
            'price' => 30.00,
            'currency' => 'EUR',
            'sales_start' => '2025-07-01',
            'sales_end' => '2025-10-10',
            'quota' => 80
        ]);

        // CSE
        $ticket5 = TicketType::create([
            'conference_id' => $conf3->id,
            'name' => 'Full Pass',
            'price' => 90.00,
            'currency' => 'EUR',
            'sales_start' => '2025-08-15',
            'sales_end' => '2025-11-09',
            'quota' => 140
        ]);

        // WEBENG
        $ticket6 = TicketType::create([
            'conference_id' => $conf4->id,
            'name' => 'General',
            'price' => 40.00,
            'currency' => 'EUR',
            'sales_start' => '2025-04-15',
            'sales_end' => '2025-06-04',
            'quota' => 150
        ]);

        // BIOHT
        $ticket7 = TicketType::create([
            'conference_id' => $conf5->id,
            'name' => 'Regular',
            'price' => 70.00,
            'currency' => 'EUR',
            'sales_start' => '2025-09-01',
            'sales_end' => '2025-11-28',
            'quota' => 160
        ]);

        /* ===========================
         * Registrations (nekoliko primera)
         * =========================== */
        Registration::create([
            'conference_id' => $conf1->id,
            'user_id'       => $author1->id,
            'ticket_type_id'=> $ticket1->id,
            'status'        => 'confirmed',
            'paid_at'       => now(),
        ]);

        Registration::create([
            'conference_id' => $conf1->id,
            'user_id'       => $attendee->id,
            'ticket_type_id'=> $ticket2->id,
            'status'        => 'pending',
        ]);

        Registration::create([
            'conference_id' => $conf2->id,
            'user_id'       => $author2->id,
            'ticket_type_id'=> $ticket3->id,
            'status'        => 'confirmed',
            'paid_at'       => now(),
        ]);

        /* ===========================
         * Submissions + review primer
         * =========================== */
        $submission1 = Submission::create([
            'submitable_type'          => Conference::class,
            'submitable_id'            => $conf1->id,
            'title'                    => 'Deep Learning for Healthcare',
            'abstract'                 => 'This paper explores DL in healthcare.',
            'status'                   => 'submitted',
            'corresponding_author_id'  => $author1->id,
            'manuscript_path'          => 'papers/deep_learning.pdf',
            'supplementary_files'      => ['papers/appendix.pdf'],
        ]);
        $submission1->authors()->attach($author1->id, [
            'author_order'   => 1,
            'is_corresponding'=> true,
        ]);

        $assignment = ReviewerAssignment::create([
            'submission_id' => $submission1->id,
            'reviewer_id'   => $reviewer1->id,
            'invited_at'    => now(),
            'due_at'        => now()->addDays(14),
        ]);

        Review::create([
            'submission_id'        => $submission1->id,
            'reviewer_id'          => $reviewer1->id,
            'recommendation'       => 'accept',
            'score_overall'        => 90,
            'comments_to_authors'  => 'Excellent work!',
            'comments_to_editors'  => 'Recommend acceptance.',
            'submitted_at'         => now(),
        ]);
    }
}
