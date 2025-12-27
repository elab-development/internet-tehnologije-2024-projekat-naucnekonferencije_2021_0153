import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../css/admin.css";

const emptyForm = {
  recommendation: "",
  score_overall: "",
  comments_to_authors: "",
  comments_to_editors: "",
};

export default function ReviewerAssignments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [forms, setForms] = useState({});

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get("/reviewer/assignments");
      const list = res.data || [];
      setItems(list);

      // pripremi form-state po submissionu
      const initialForms = {};
      list.forEach((a) => {
        const s = a.submission;
        const myReview = (s?.reviews || [])[0];
        initialForms[s.id] = myReview
          ? {
              recommendation: myReview.recommendation || "",
              score_overall:
                typeof myReview.score_overall === "number"
                  ? String(myReview.score_overall)
                  : "",
              comments_to_authors: myReview.comments_to_authors || "",
              comments_to_editors: myReview.comments_to_editors || "",
              _reviewId: myReview.id,
            }
          : { ...emptyForm };
      });
      setForms(initialForms);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju dodela.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (sid, e) => {
    const { name, value } = e.target;
    setForms((fs) => ({ ...fs, [sid]: { ...fs[sid], [name]: value } }));
  };

  const submitReview = async (submissionId, accepted) => {
    if (!accepted) {
      alert("Morate prvo prihvatiti dodelu da biste mogli da pošaljete recenziju.");
      return;
    }

    const f = forms[submissionId] || emptyForm;
    const payload = {
      reviewer_id: user.id,
      recommendation: f.recommendation || null,
      score_overall: f.score_overall === "" ? null : Number(f.score_overall),
      comments_to_authors: f.comments_to_authors || null,
      comments_to_editors: f.comments_to_editors || null,
      attachment_paths: [],
    };

    setSavingId(submissionId);
    try {
      if (f._reviewId) {
        await axios.put(`/reviews/${f._reviewId}`, payload);
      } else {
        await axios.post(`/submissions/${submissionId}/reviews`, payload);
      }
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri čuvanju recenzije.");
    } finally {
      setSavingId(null);
    }
  };

  const respondAssignment = async (assignmentId, action) => {
    try {
      if (action === "accept") {
        await axios.put(`/assignments/${assignmentId}/accept`);
      } else {
        await axios.put(`/assignments/${assignmentId}/decline`);
      }
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Greška prilikom odgovora na poziv.");
    }
  };

  if (loading) return <div className="container admin__container">Učitavanje…</div>;
  if (err)
    return (
      <div className="container admin__container">
        <div className="alert alert--error">{err}</div>
      </div>
    );

  return (
    <div className="container admin__container">
      <header className="admin__head">
        <div>
          <h1 className="admin__title">Moje dodele</h1>
          <p className="admin__lead">Submisije dodeljene za recenziju.</p>
        </div>
      </header>

      <section className="grid admin__grid">
        {items.map((a) => {
          const s = a.submission;
          const f = forms[s.id] || emptyForm;
          const invited = !!a.invited_at;
          const accepted = !!a.accepted_at;
          const declined = !!a.declined_at;
          const hasReview = !!f._reviewId;

          return (
            <article className="card admin__item" key={a.id}>
              <div className="admin__itemHead">
                <div>
                  <h3 className="admin__itemTitle">{s.title}</h3>
                  <div className="admin__meta">
                    <span className="tag">{s.status}</span>
                    {s.corresponding_author?.name && (
                      <span>• {s.corresponding_author.name}</span>
                    )}
                    {invited && !accepted && !declined && <span>• pozvan</span>}
                    {accepted && <span>• prihvaćeno</span>}
                    {declined && <span>• odbijeno</span>}
                  </div>
                </div>
              </div>

              <p className="admin__desc">
                PDF:{" "}
                {s.manuscript_path ? (
                  <a href={s.manuscript_path} target="_blank" rel="noreferrer">
                    otvori rukopis
                  </a>
                ) : (
                  <em>nema fajla</em>
                )}
              </p>

              {/* Accept / Decline – prikazi dok nije odlučeno */}
              {!accepted && !declined && (
                <div className="admin__actions" style={{ marginBottom: ".5rem" }}>
                  <button
                    className="btn btn--primary"
                    onClick={() => respondAssignment(a.id, "accept")}
                  >
                    Prihvati
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={() => respondAssignment(a.id, "decline")}
                  >
                    Odbij
                  </button>
                </div>
              )}

              {/* Review forma – SAMO AKO JE PRIHVAĆENO */}
              {accepted && (
                <form
                  className="admin__formGrid"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitReview(s.id, accepted);
                  }}
                >
                  <label className="field">
                    <span className="field__label">Preporuka</span>
                    <select
                      name="recommendation"
                      className="field__input"
                      value={f.recommendation}
                      onChange={(e) => onChange(s.id, e)}
                    >
                      <option value="">— izaberi —</option>
                      <option value="accept">accept</option>
                      <option value="minor">minor revisions</option>
                      <option value="major">major revisions</option>
                      <option value="reject">reject</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="field__label">Ukupan skor (0–100)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="score_overall"
                      className="field__input"
                      value={f.score_overall}
                      onChange={(e) => onChange(s.id, e)}
                    />
                  </label>

                  <label className="field field--full">
                    <span className="field__label">Komentari autorima</span>
                    <textarea
                      name="comments_to_authors"
                      rows={3}
                      className="field__input"
                      value={f.comments_to_authors}
                      onChange={(e) => onChange(s.id, e)}
                    />
                  </label>

                  <label className="field field--full">
                    <span className="field__label">Komentari urednicima</span>
                    <textarea
                      name="comments_to_editors"
                      rows={3}
                      className="field__input"
                      value={f.comments_to_editors}
                      onChange={(e) => onChange(s.id, e)}
                    />
                  </label>

                  <div className="admin__formActions">
                    <button className="btn btn--primary" disabled={savingId === s.id}>
                      {savingId === s.id
                        ? "Čuvam…"
                        : hasReview
                        ? "Sačuvaj izmene"
                        : "Pošalji recenziju"}
                    </button>
                  </div>
                </form>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
