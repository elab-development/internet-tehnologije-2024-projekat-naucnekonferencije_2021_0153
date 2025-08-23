import React from "react";
import "../css/home.css";

export default function HomePage() {
  return (
    <div className="app">
     

      {/* HERO */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <h1>
              Platforma za <span className="text-gradient">naučne konferencije</span> i{" "}
              <span className="text-gradient">časopise</span>
            </h1>
            <p className="lead">
              Kreiraj konferenciju, dodaj tipove karata, primi prijave i rukopise, dodeli recenzente i objavi radove u izdanju časopisa.
            </p>
            <div className="hero__actions">
              <a href="/register" className="btn btn--primary">Kreiraj nalog</a>
              <a href="#features" className="btn btn--ghost">Pogledaj funkcionalnosti</a>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="stat__value">250+</div>
                <div className="stat__label">Objavljenih radova</div>
              </div>
              <div className="stat">
                <div className="stat__value">30+</div>
                <div className="stat__label">Konferencija godišnje</div>
              </div>
              <div className="stat">
                <div className="stat__value">5k+</div>
                <div className="stat__label">Korisnika</div>
              </div>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="card-preview">
              <div className="badge">LIVE</div>
              <div className="cp__title">AICONF 2025 — Program</div>
              <ul className="cp__list">
                <li>
                  <span className="pill">09:00</span> Otvaranje &amp; Keynote
                </li>
                <li>
                  <span className="pill">10:30</span> ML u medicini
                </li>
                <li>
                  <span className="pill">12:00</span> Panel: AI &amp; etika
                </li>
                <li className="muted">+ još 24 sesije</li>
              </ul>
            </div>
            <div className="floating floating--one" />
            <div className="floating floating--two" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section">
        <div className="container">
          <h2>Ključne funkcionalnosti</h2>
          <p className="section__lead">
            Sve što očekuješ od moderne platforme za naučne događaje i publikacije.
          </p>
          <div className="grid features">
            <Feature
              title="Prodaja karata &amp; registracije"
              desc="Više tipova kotizacija, kvote, online prijava i check-in na događaju."
              icon={<TicketIcon />}
            />
            <Feature
              title="Tok recenziranja"
              desc="Dodela recenzenata, preporuke (accept/minor/major/reject), komentari i fajlovi."
              icon={<ReviewIcon />}
            />
            <Feature
              title="Program konferencije"
              desc="Jednostavno uređivanje rasporeda kroz JSON polje i prikaz na sajtu."
              icon={<ScheduleIcon />}
            />
            <Feature
              title="Časopis i brojevi"
              desc="Kreiranje brojeva časopisa (volumen, broj, godina) i povezivanje radova."
              icon={<JournalIcon />}
            />
          </div>
        </div>
      </section>

      {/* UPCOMING CONFS */}
      <section id="confs" className="section section--alt">
        <div className="container">
          <h2>Predstojeće konferencije</h2>
          <div className="grid confs">
            {[
              { title: "AICONF 2025", date: "1–3. sep 2025", place: "Beograd", tag: "Otvorene prijave" },
              { title: "DataSci Summit", date: "15–17. okt 2025", place: "Novi Sad", tag: "Rane prijave" },
              { title: "SE Europe 2025", date: "10–12. nov 2025", place: "Niš", tag: "Uskoro" },
            ].map((c, i) => (
              <div className="card conf" key={i}>
                <div className="conf__header">
                  <span className="tag">{c.tag}</span>
                  <h3>{c.title}</h3>
                </div>
                <div className="conf__meta">
                  <span>{c.date}</span>
                  <span>•</span>
                  <span>{c.place}</span>
                </div>
                <div className="conf__actions">
                  <a href="/conferences/1" className="btn btn--ghost">Detalji</a>
                  <a href="/register" className="btn btn--accent">Kupi kartu</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section id="journal" className="section">
        <div className="container journal">
          <div className="journal__copy">
            <h2>Objavi u našem časopisu</h2>
            <p>
              Poveži konferencijski rad sa specijalnim brojem časopisa. Podrška za DOI, metapodatke i uredničke uloge.
            </p>
            <div className="journal__actions">
              <a href="/submissions/new" className="btn btn--primary">Pošalji rad</a>
              <a href="/journal" className="btn btn--ghost">Saznaj više</a>
            </div>
          </div>
          <div className="journal__card" aria-hidden="true">
            <div className="jc__title">Journal of AI Research</div>
            <div className="jc__row">
              <span>ISSN (Online)</span>
              <strong>9876-5432</strong>
            </div>
            <div className="jc__row">
              <span>Aktuelni broj</span>
              <strong>Vol. 12, No. 2 (2025)</strong>
            </div>
            <div className="jc__row">
              <span>Status</span>
              <strong>Otvoreno za prijave</strong>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="cta">
        <div className="container cta__inner">
          <h3>Spremni da pokrenete svoju konferenciju?</h3>
          <p>Napravite događaj, dodajte tipove karata i objavite program za nekoliko minuta.</p>
          <div className="cta__actions">
            <a href="/register" className="btn btn--primary">Kreiraj nalog</a>
            <a href="/demo" className="btn btn--ghost">Pogledaj demo</a>
          </div>
        </div>
      </section>

    
    </div>
  );
}

function Feature({ title, desc, icon }) {
  return (
    <div className="card feature">
      <div className="feature__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <a className="link" href="#!">Saznaj više →</a>
    </div>
  );
}

/* ------- Ikonice (inline SVG) ------- */

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="i">
      <path d="M3 7h18v4a2 2 0 0 0 0 2v4H3v-4a2 2 0 0 0 0-2zM8 7v10" />
    </svg>
  );
}
function ReviewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="i">
      <path d="M4 4h16v12H7l-3 3V4z" />
      <path d="M8 8h8M8 12h6" />
    </svg>
  );
}
function ScheduleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="i">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function JournalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="i">
      <path d="M5 3h10a4 4 0 0 1 4 4v14H7a4 4 0 0 1-4-4V3z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  );
}
