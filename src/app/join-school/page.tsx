"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinSchoolPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/school/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_code: code.toUpperCase().trim(), role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Redirect based on role
      if (role === "teacher") {
        router.push("/dashboard");
      } else {
        router.push("/app");
      }
    } catch {
      setError("Could not connect. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)",
      fontFamily: "Lexend, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "white",
        borderRadius: "20px",
        padding: "40px 36px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: "1px solid #f1f5f9",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏫</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Join Your School
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "15px" }}>
            Enter the code your teacher gave you
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* School code input */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "8px", fontSize: "14px" }}>
              School code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="e.g. HLTP4821"
              maxLength={10}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "2px solid #e2e8f0",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textAlign: "center",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Role selection */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "10px", fontSize: "14px" }}>
              I am a...
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {(["student", "teacher"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: `2px solid ${role === r ? "#7c3aed" : "#e2e8f0"}`,
                    backgroundColor: role === r ? "rgba(124,58,237,0.06)" : "white",
                    color: role === r ? "#7c3aed" : "#64748b",
                    fontWeight: role === r ? 700 : 500,
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {r === "student" ? "🎒 Student" : "👩‍🏫 Teacher"}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: loading || code.length < 6
                ? "#e2e8f0"
                : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              color: loading || code.length < 6 ? "#94a3b8" : "white",
              fontWeight: 700,
              fontSize: "16px",
              cursor: loading || code.length < 6 ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Joining..." : "Join School"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#94a3b8" }}>
          <Link href="/app" style={{ color: "#7c3aed" }}>Skip for now</Link>
          {" · "}
          <Link href="/schools-privacy" style={{ color: "#7c3aed" }}>Privacy policy</Link>
        </p>
      </div>
    </main>
  );
}
