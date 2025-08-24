// src/pages/admin/AdminSubmissions.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/admin.css";

export default function AdminSubmissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [reviewers, setReviewers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/submissions");
        const list = res.data?.data || res.data || [];
        if (mounted) setSubs(list);

        const usersRes = await axios.get("/users?role=reviewer");
        if (mounted) setReviewers(usersRes.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Greška pri učitavanju.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const assignReviewer = async (submissionId, reviewerId) => {
    try {
      await axios.post(`/submissions/${submissionId}/assignments`, {
        reviewer_id: reviewerId,
      });
      refreshSubmission(submissionId);
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri dodeli recenzenta.");
    }
  };

  const removeReviewer = async (assignmentId, submissionId) => {
    try {
      await axios.delete(`/assignments/${assignmentId}`);
      refreshSubmission(submissionId);
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri uklanjanju recenzenta.");
    }
  };

  const refreshSubmission = async (submissionId) => {
    const res = await axios.get(`/submissions/${submissionId}`);
    setSubs((s) =>
      s.map((sub) => (sub.id === submissionId ? res.data : sub))
    );
  };

  if (loading)
    return <div className="container admin__container">Učitavanje…</div>;
  if (err)
    return (
      <div className="container admin__container">
        <div className="alert alert--error">{err}</div>
      </div>
    );

  return (
    <div className="container admin__container">
      <div className="admin__head">
        <div>
          <h1 className="admin__title">Submisije</h1>
          <p className="admin__lead">
            Pregled svih radova i dodela recenzenata.
          </p>
        </div>
      </div>

      <div className="grid admin__grid">
        {subs.map((s) => (
          <div className="card admin__item" key={s.id}>
            <div className="admin__itemHead">
              <div>
                <h3 className="admin__itemTitle">{s.title}</h3>
                <div className="admin__meta">
                  <span className="tag">{s.status}</span>
                  {s.corresponding_author?.name && (
                    <span>• {s.corresponding_author.name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="admin__desc">
              <h4>Recenzenti:</h4>
              <ul>
                {s.reviewer_assignments?.length ? (
                  s.reviewer_assignments.map((a) => (
                    <li key={a.id} className="admin__reviewer">
                      {a.reviewer?.name}{" "}
                      {a.accepted_at
                        ? "(prihvatio)"
                        : a.declined_at
                        ? "(odbijeno)"
                        : "(pozvan)"}
                      <button
                        className="btn btn--small btn--ghost"
                        onClick={() => removeReviewer(a.id, s.id)}
                      >
                        ❌
                      </button>
                    </li>
                  ))
                ) : (
                  <em>Nema dodeljenih recenzenata.</em>
                )}
              </ul>
            </div>

            <div className="admin__actions">
              <select
                onChange={(e) =>
                  e.target.value &&
                  assignReviewer(s.id, parseInt(e.target.value))
                }
                defaultValue=""
              >
                <option value="">+ Dodaj recenzenta</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
