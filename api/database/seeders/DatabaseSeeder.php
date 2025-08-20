<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Conference;
use App\Models\TicketType;
use App\Models\Registration;
use App\Models\Journal;
use App\Models\Issue;
use App\Models\Submission;
use App\Models\ReviewerAssignment;
use App\Models\Review;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
         // 1) Kreiramo korisnike
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'affiliation' => 'Org University',
        ]);

        $author = User::create([
            'name' => 'Author One',
            'email' => 'author@example.com',
            'password' => bcrypt('password'),
            'role' => 'author',
            'affiliation' => 'Science Faculty',
        ]);

        $reviewer = User::create([
            'name' => 'Reviewer One',
            'email' => 'reviewer@example.com',
            'password' => bcrypt('password'),
            'role' => 'reviewer',
            'affiliation' => 'Tech Institute',
        ]);

        // 2) Kreiramo konferenciju
        $conf = Conference::create([
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

        // 3) Tip karte
        $ticket = TicketType::create([
            'conference_id' => $conf->id,
            'name' => 'Early Bird',
            'price' => 50.00,
            'currency' => 'EUR',
            'sales_start' => '2025-06-01',
            'sales_end' => '2025-07-31',
            'quota' => 100
        ]);

        // 4) Registracija autora
        Registration::create([
            'conference_id' => $conf->id,
            'user_id' => $author->id,
            'ticket_type_id' => $ticket->id,
            'status' => 'confirmed',
            'paid_at' => now(),
        ]);

        // 5) Časopis i broj
        $journal = Journal::create([
            'title' => 'Journal of AI Research',
            'issn_print' => '1234-5678',
            'issn_online' => '9876-5432',
            'publisher' => 'TechPress',
            'aims_scope' => 'Covers all AI topics'
        ]);

        $issue = Issue::create([
            'journal_id' => $journal->id,
            'volume' => '12',
            'number' => '2',
            'year' => '2025',
            'special_issue_title' => 'AI in Medicine',
            'status' => 'open'
        ]);

        // 6) Rukopis
        $submission = Submission::create([
            'submitable_type' => Conference::class,
            'submitable_id' => $conf->id,
            'title' => 'Deep Learning for Healthcare',
            'abstract' => 'This paper explores DL in healthcare.',
            'status' => 'submitted',
            'corresponding_author_id' => $author->id,
            'manuscript_path' => 'papers/deep_learning.pdf',
            'supplementary_files' => ['papers/appendix.pdf'],
        ]);

        // Povezivanje autora sa submissionom
        $submission->authors()->attach($author->id, [
            'author_order' => 1,
            'is_corresponding' => true,
        ]);

        // 7) Assignment recenzenta
        $assignment = ReviewerAssignment::create([
            'submission_id' => $submission->id,
            'reviewer_id' => $reviewer->id,
            'invited_at' => now(),
            'due_at' => now()->addDays(14),
        ]);

        // 8) Recenzija
        Review::create([
            'submission_id' => $submission->id,
            'reviewer_id' => $reviewer->id,
            'recommendation' => 'accept',
            'score_overall' => 90,
            'comments_to_authors' => 'Excellent work!',
            'comments_to_editors' => 'Recommend acceptance.',
            'submitted_at' => now(),
        ]);
    }
}
