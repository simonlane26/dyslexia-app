"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  min_words: number;
  due_date: string | null;
  created_at: string;
}

interface StudentData {
  memberId: string;
  displayName: string;
  sessionCount: number;
  totalWords: number;
  avgSentenceLength: number | null;
  badges: string[];
  assignmentStatus: "completed" | "in_progress" | "not_started";
  assignmentWords: number;
}

interface DashboardData {
  students: StudentData[];
  schoolName: string;
  schoolCode: string | null;
  activeAssignment: Assignment | null;
}

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  "Regular Writer":               { bg: "#eff6ff", text: "#2563eb" },
  "Clearer Sentences":            { bg: "#f0fdf4", text: "#16a34a" },
  "Writing Confidence Improving": { bg: "#fdf4ff", text: "#7c3aed" },
  "Easier to Read":               { bg: "#fff7ed", text: "#c2410c" },
};

const STATUS_STYLE = {
  completed:   { bg: "#f0fdf4", text: "#16a34a", label: "Completed" },
  in_progress: { bg: "#fefce8", text: "#ca8a04", label: "In progress" },
  not_started: { bg: "#f8fafc", text: "#94a3b8", label: "Not started" },
};

export function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Assignment form state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMinWords, setFormMinWords] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  function loadDashboard() {
    setLoading(true);
    setError(null);
    fetch("/api/school/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message ?? "Could not load dashboard.");
        setLoading(false);
      });
  }

  function copyCode() {
    if (!data?.schoolCode) return;
    navigator.clipboard.writeText(data.schoolCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) { setFormError("Please enter a title."); return; }
    setFormSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/school/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          min_words: formMinWords ? parseInt(formMinWords, 10) : 0,
          due_date: formDueDate || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create assignment");
      setShowAssignForm(false);
      setFormTitle(""); setFormDescription(""); setFormMinWords(""); setFormDueDate("");
      loadDashboard();
    } catch (err: any) {
      setFormError(err.message ?? "Something went wrong.");
    } finally {
      setFormSaving(false);
    }
  }

  async function handleEndAssignment() {
    if (!confirm("End this assignment? Students will no longer see it.")) return;
    await fetch("/api/school/assignments", { method: "DELETE" });
    loadDashboard();
  }

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#64748b", fontFamily: "Lexend, sans-serif" }}>
        Loading class data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#dc2626", fontFamily: "Lexend, sans-serif" }}>
        <p style={{ marginBottom: "16px" }}>{error}</p>
        <Link href="/app" style={{ color: "#2563eb" }}>Go back to the editor</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px", fontFamily: "Lexend, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              {data?.schoolName ?? "Class Dashboard"}
            </h1>
            <p style={{ color: "#64748b", marginTop: "8px", marginBottom: 0 }}>
              Writing progress — last 30 days. No writing content is shown.
            </p>
          </div>
          <Link
            href="/app"
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            ← Back to editor
          </Link>
        </div>

        {/* School code banner */}
        {data?.schoolCode && (
          <div style={{
            marginTop: "24px",
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#7c3aed", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                School join code
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#1e293b", letterSpacing: "0.1em" }}>
                {data.schoolCode}
              </div>
            </div>
            <button
              type="button"
              onClick={copyCode}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(139,92,246,0.3)",
                backgroundColor: codeCopied ? "#7c3aed" : "white",
                color: codeCopied ? "white" : "#7c3aed",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {codeCopied ? "Copied!" : "Copy code"}
            </button>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Share this code with students. They enter it at{" "}
              <strong>dyslexiawrite.com/join-school</strong>
            </p>
          </div>
        )}
      </div>

      {/* Active assignment */}
      <div style={{ marginBottom: "32px" }}>
        {data?.activeAssignment ? (
          <div style={{
            padding: "20px 24px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Active assignment
                </div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "#14532d", marginBottom: "4px" }}>
                  {data.activeAssignment.title}
                </div>
                {data.activeAssignment.description && (
                  <div style={{ fontSize: "14px", color: "#166534" }}>{data.activeAssignment.description}</div>
                )}
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
                  {data.activeAssignment.min_words > 0 && (
                    <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>
                      Minimum: {data.activeAssignment.min_words} words
                    </span>
                  )}
                  {data.activeAssignment.due_date && (
                    <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>
                      Due: {new Date(data.activeAssignment.due_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowAssignForm(true)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #bbf7d0",
                    backgroundColor: "white",
                    color: "#16a34a",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  New assignment
                </button>
                <button
                  type="button"
                  onClick={handleEndAssignment}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #fca5a5",
                    backgroundColor: "white",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  End assignment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>No active assignment.</span>
            <button
              type="button"
              onClick={() => setShowAssignForm(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              + Set assignment
            </button>
          </div>
        )}
      </div>

      {/* Assignment creation form */}
      {showAssignForm && (
        <div style={{
          marginBottom: "32px",
          padding: "24px",
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>
            New assignment
          </h3>
          <form onSubmit={handleCreateAssignment}>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Task title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Write about your family"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#1e293b",
                    fontFamily: "Lexend, sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Description (optional)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Describe what your family like doing. Try to write at least 3 sentences."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#1e293b",
                    fontFamily: "Lexend, sans-serif",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                    Minimum words (optional)
                  </label>
                  <input
                    type="number"
                    value={formMinWords}
                    onChange={(e) => setFormMinWords(e.target.value)}
                    placeholder="e.g. 100"
                    min={0}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#1e293b",
                      fontFamily: "Lexend, sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="formDueDate" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                    Due date (optional)
                  </label>
                  <input
                    id="formDueDate"
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#1e293b",
                      fontFamily: "Lexend, sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>
            {formError && (
              <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "12px", marginBottom: 0 }}>{formError}</p>
            )}
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button
                type="submit"
                disabled={formSaving}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                  color: "white",
                  cursor: formSaving ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  opacity: formSaving ? 0.7 : 1,
                }}
              >
                {formSaving ? "Saving..." : "Set assignment"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAssignForm(false); setFormError(null); }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student grid */}
      {!data?.students.length ? (
        <EmptyState />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}>
          {data.students.map((s) => (
            <StudentCard key={s.memberId} student={s} hasActiveAssignment={!!data.activeAssignment} assignmentMinWords={data.activeAssignment?.min_words ?? 0} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <p style={{ marginTop: "48px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
        Dyslexia Write never stores student writing.{" "}
        <Link href="/schools-privacy" style={{ color: "#7c3aed" }}>Schools privacy policy</Link>
      </p>
    </div>
  );
}

function StudentCard({ student, hasActiveAssignment, assignmentMinWords }: {
  student: StudentData;
  hasActiveAssignment: boolean;
  assignmentMinWords: number;
}) {
  const statusStyle = STATUS_STYLE[student.assignmentStatus];

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      border: "1px solid #f1f5f9",
    }}>
      <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b", marginBottom: "4px", marginTop: 0 }}>
        {student.displayName}
      </h3>
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
        {student.sessionCount} session{student.sessionCount !== 1 ? "s" : ""} this month
      </div>

      {/* Assignment status row */}
      {hasActiveAssignment && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
          padding: "8px 12px",
          backgroundColor: statusStyle.bg,
          borderRadius: "8px",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: statusStyle.text }}>
            {student.assignmentStatus === "completed" && "✓ "}
            {student.assignmentStatus === "in_progress" && "✎ "}
            {student.assignmentStatus === "not_started" && "◯ "}
            {statusStyle.label}
          </span>
          {student.assignmentWords > 0 && (
            <span style={{ fontSize: "12px", color: statusStyle.text, opacity: 0.8 }}>
              — {student.assignmentWords.toLocaleString()} word{student.assignmentWords !== 1 ? "s" : ""}
              {assignmentMinWords > 0 && ` / ${assignmentMinWords}`}
            </span>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
        <Stat label="Words written" value={student.totalWords.toLocaleString()} />
        {student.avgSentenceLength !== null && (
          <Stat label="Avg sentence" value={`${student.avgSentenceLength} words`} />
        )}
      </div>

      {student.badges.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {student.badges.map((badge) => {
            const style = BADGE_STYLES[badge] ?? { bg: "#f1f5f9", text: "#475569" };
            return (
              <span key={badge} style={{
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: style.bg,
                color: style.text,
              }}>
                {badge}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{label}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: "56px", marginBottom: "16px" }}>📝</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#64748b", marginBottom: "8px" }}>
        No students yet
      </h3>
      <p style={{ maxWidth: "360px", margin: "0 auto" }}>
        Students appear here once they join using the school code and start writing.
      </p>
    </div>
  );
}
