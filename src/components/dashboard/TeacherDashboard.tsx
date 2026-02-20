"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StudentData {
  memberId: string;
  displayName: string;
  sessionCount: number;
  totalWords: number;
  avgSentenceLength: number | null;
  badges: string[];
}

interface DashboardData {
  students: StudentData[];
  schoolName: string;
  schoolCode: string | null;
}

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  "Regular Writer":               { bg: "#eff6ff", text: "#2563eb" },
  "Clearer Sentences":            { bg: "#f0fdf4", text: "#16a34a" },
  "Writing Confidence Improving": { bg: "#fdf4ff", text: "#7c3aed" },
  "Easier to Read":               { bg: "#fff7ed", text: "#c2410c" },
};

export function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
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
  }, []);

  function copyCode() {
    if (!data?.schoolCode) return;
    navigator.clipboard.writeText(data.schoolCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
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
      <div style={{ marginBottom: "40px" }}>
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

      {/* Student grid */}
      {!data?.students.length ? (
        <EmptyState />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px",
        }}>
          {data.students.map((s) => (
            <StudentCard key={s.memberId} student={s} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <p style={{ marginTop: "48px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
        Dyslexia Writer never stores student writing.{" "}
        <Link href="/schools-privacy" style={{ color: "#7c3aed" }}>Schools privacy policy</Link>
      </p>
    </div>
  );
}

function StudentCard({ student }: { student: StudentData }) {
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
