
# Aplikacija za naučne konferencije 

Ovo je monorepo za veb aplikaciju za naučne konferencije sa **Laravel (API backend)** i **React (SPA frontend)** delovima.
Aplikacija pokriva registraciju/prijavu, rad sa konferencijama, tipovima karata, prijavama radova, dodelu recenzenata i recenzije.

---

## Sadržaj
1. [Opis](#opis)
2. [Funkcionalnosti](#funkcionalnosti)
3. [Arhitektura i tehnologije](#arhitektura-i-tehnologije)
4. [Struktura direktorijuma](#struktura-direktorijuma)
5. [Zahtevi](#zahtevi)
6. [Podešavanje — Backend (Laravel)](#podešavanje--backend-laravel)
7. [Podešavanje — Frontend (React)](#podešavanje--frontend-react)
8. [Autentikacija i uloge](#autentikacija-i-uloge)
9. [API rute (primeri)](#api-rute-primeri)
10. [Frontend rute](#frontend-rute)
11. [Promenljive okruženja](#promenljive-okruženja)
12. [Seeding (opciono)](#seeding-opciono)
13. [Build & Deploy](#build--deploy)
---

## Opis
Full‑stack aplikacija za administraciju i učešće na naučnim konferencijama:
- Učesnici se registruju, prijavljuju i pregledaju konferencije.
- Autori prijavljuju radove (submissions) i prate status.
- Recenzenti dobijaju dodeljene radove i ostavljaju recenzije.
- Administrator upravlja konferencijama, tipovima karata i dodelom recenzenata.
- Prikaz cena u različitim valutama na frontendu (konverzija na klijentu).

## Funkcionalnosti
- **Korisnici**: registracija, login, logout, profil.
- **Konferencije**: CRUD (admin), pregled (svi).
- **Karte**: tipovi karata (admin), pregled i rezervacija (korisnik).
- **Radovi (Submissions)**: kreiranje, pregled autora; dodela recenzenata (admin); recenzije (reviewer).
- **Recenzije**: unos i pregled recenzija.
- **Valute**: prikaz cena u različitim valutama (frontend‑side konverzija).

## Arhitektura i tehnologije
- **Backend**: Laravel 10+, PHP 8.2+, MySQL/MariaDB, Eloquent ORM, Laravel Sanctum (token‑based auth).
- **Frontend**: React 18, react-router-dom, Context API za auth, Vite ili CRA (u zavisnosti od podešavanja), Fetch/Axios za API.
- **Autorizacija**: uloge `admin`, `organizer`, `editor`, `reviewer`, `author`, `attendee` (u praksi: admin, reviewer, author/attendee).

## Struktura direktorijuma
```
/api                 # Laravel backend
  app/
    Http/Controllers/
      AuthController.php
      RegistrationController.php
      ConferenceController.php
      ReviewerAssignmentController.php
      ReviewController.php
      SubmissionController.php
      TicketTypeController.php
    Models/
      User.php
      Conference.php
      Submission.php
      Review.php
      TicketType.php
  database/
    migrations/
    seeders/
  routes/
    api.php
  .env.example
  composer.json

/frontend            # React SPA
  src/
    pages/
      HomePage.jsx
      Login.jsx
      Register.jsx
      Profil.jsx
      Konferencije.jsx
      ConferenceDetails.jsx
      SubmitNew.jsx
      admin/
        AdminDashboard.jsx
        AdminSubmissions.jsx
        AdminTicketTypes.jsx
      reviewer/
        ReviewerAssignments.jsx
    components/
      Navbar.jsx
      Footer.jsx
      ProtectedRoute.jsx
    context/
      AuthContext.jsx
    api/
      axios.js
  public/
  package.json
 
```


## Zahtevi
- **Node.js** 18+ i **npm** ili **pnpm**
- **PHP** 8.2+
- **Composer**
- **MySQL/MariaDB** (lokalno ili Docker)
- (Opciono) **Postman/Insomnia** za testiranje API‑ja

## Podešavanje — Backend (Laravel)
1. Uđite u `api` direktorijum i instalirajte zavisnosti:
   ```bash
   cd api
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
2. U `.env` podesite konekciju na bazu (`DB_*` varijable).  
3. Migracije i (opciono) seederi:
   ```bash
   php artisan migrate
   # php artisan db:seed   # ako koristite seedere
   ```
4. Pokrenite dev server:
   ```bash
   php artisan serve
   # podrazumevano na http://127.0.0.1:8000
   ```

## Podešavanje — Frontend (React)
1. U drugom terminalu uđite u `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Vite: http://127.0.0.1:5173  (ili CRA: http://localhost:3000)
   ```
2. Podesite **API bazni URL** u `src/api/axios.js` (npr. `http://127.0.0.1:8000/api`).

## Autentikacija i uloge
- Backend koristi **Laravel Sanctum** ili klasične API tokene (zavisno od implementacije).  
- Nakon uspešne prijave frontend čuva token u memoriji (Context) ili localStorage.  
- Zaštićene rute (frontend) prolaze kroz `<ProtectedRoute />` komponentu.  
- Uloge: `admin` dobija administratorski panel; `reviewer` vidi dodeljene radove; `author/attendee` ima korisničke opcije.

## API rute (primeri)
> Bazni prefiks: `/api`

**Auth**
```
POST   /api/register        { name, email, password, password_confirmation, role?, affiliation?, orcid? }
POST   /api/login           { email, password }  → token
POST   /api/logout
GET    /api/me              → profil ulogovanog korisnika
```

**Konferencije**
```
GET    /api/conferences
GET    /api/conferences/{id}
POST   /api/conferences           (admin)
PUT    /api/conferences/{id}      (admin)
DELETE /api/conferences/{id}      (admin)
```

**Tipovi karata**
```
GET    /api/ticket-types
POST   /api/ticket-types          (admin)
DELETE /api/ticket-types/{id}     (admin)
```

**Submissions / Reviews / Assignment**
```
POST   /api/submissions                 (author)
GET    /api/submissions/my              (author)
GET    /api/admin/submissions           (admin)
POST   /api/admin/assignments           (admin)  # {submission_id, reviewer_id}
DELETE /api/admin/assignments/{id}      (admin)
GET    /api/reviewer/assignments        (reviewer)

POST   /api/reviews                     (reviewer) # {submission_id, score, comment}
GET    /api/reviews/{submission_id}
```



## Frontend rute
U `src/App.jsx` (ili `App.js`) koriste se rute (primer):

- `/` → `<HomePage />`
- `/login` → `<Login />`
- `/register` → `<Register />`
- `/profil` → `<Profil />` *(Protected)*
- `/konferencije` → `<Konferencije />`
- `/konferencije/:id` → `<ConferenceDetails />`
- `/submit` → `<SubmitNew />` *(Author)*
- `/admin` → `<AdminDashboard />` *(Admin)*
- `/admin/submissions` → `<AdminSubmissions />` *(Admin)*
- `/admin/ticket-types` → `<AdminTicketTypes />` *(Admin)*
- `/reviewer/assignments` → `<ReviewerAssignments />` *(Reviewer)*

## Promenljive okruženja
**Backend (`api/.env`)**:
```
APP_NAME=Conferences
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=conferences_db
DB_USERNAME=root
DB_PASSWORD=

# Ako koristite Sanctum / CORS
SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=127.0.0.1:5173,localhost:5173
SESSION_DOMAIN=localhost
```

**Frontend (`frontend/.env`)**:
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
# Opciono za konverziju valuta (frontend‑only, bez ključa)
VITE_OPEN_EXCHANGE_BASE=https://api.exchangerate.host/latest
```

## Seeding (opciono)
Kreirajte seedere za brzi start (npr. admin i primer konferencije). Primer korisnika:

- **Admin**: `admin@demo.com` / `password`
- **Reviewer**: `reviewer@demo.com` / `password`
- **Author**: `author@demo.com` / `password`

> Napomena: Lozinke i nalozi su primeri; ne koristiti u produkciji.

## Build & Deploy
**Frontend (Vite):**
```
cd frontend
npm run build
# izlaz u dist/
```

**Backend (Laravel):**
- Podesite `.env` za produkciju, uradite migracije (`php artisan migrate --force`), i konfigurišite web server (Nginx/Apache) da servisira `/public`.
- Dozvole nad `storage/` i `bootstrap/cache/` direktorijumima.



## Licenca
MIT (ili prilagodite prema potrebi).
