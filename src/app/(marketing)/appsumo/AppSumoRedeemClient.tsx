"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { landing } from "@/lib/landingTheme";

export function AppSumoRedeemClient() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/appsumo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Could not connect. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: landing.bg,
        fontFamily: landing.fontBody,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: landing.panel,
          borderRadius: "20px",
          padding: "40px 36px",
          boxShadow: "0 8px 32px rgba(43,42,40,0.08)",
          border: `1px solid ${landing.line}`,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              fontFamily: landing.fontDisplay,
              fontSize: "1.6rem",
              fontWeight: 600,
              color: landing.ink,
              margin: 0,
            }}
          >
            Redeem your AppSumo purchase
          </h1>
          <p style={{ color: landing.inkMuted, marginTop: "10px", fontSize: "15px", lineHeight: 1.5 }}>
            Create or sign in to your Dyslexia Write account, then enter your
            AppSumo code below to activate your lifetime deal.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                padding: "16px",
                borderRadius: "10px",
                background: landing.tealTint,
                color: landing.teal,
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              Your AppSumo lifetime deal is active. Welcome to Dyslexia Write!
            </div>
            <button
              type="button"
              onClick={() => router.push("/app")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: landing.amber,
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Start writing →
            </button>
          </div>
        ) : (
          <>
            <SignedOut>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "10px",
                      border: "none",
                      background: landing.amber,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Create your account
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "10px",
                      border: `1.5px solid ${landing.line}`,
                      background: "transparent",
                      color: landing.ink,
                      fontWeight: 600,
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    I already have an account — Sign in
                  </button>
                </SignInButton>
              </div>
              <p style={{ textAlign: "center", fontSize: "13px", color: landing.inkFaint }}>
                Once you're signed in, come back to this page to enter your code.
              </p>
            </SignedOut>

            <SignedIn>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      color: landing.ink,
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    AppSumo code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))
                    }
                    placeholder="DW-AS-XXXXXXXX"
                    maxLength={14}
                    required
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      border: `2px solid ${landing.line}`,
                      fontSize: "18px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textAlign: "center",
                      color: landing.ink,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = landing.amber)}
                    onBlur={(e) => (e.target.style.borderColor = landing.line)}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      background: landing.roseTint,
                      border: `1px solid ${landing.rose}`,
                      color: landing.rose,
                      fontSize: "14px",
                    }}
                  >
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
                    background: loading || code.length < 6 ? landing.line : landing.amber,
                    color: loading || code.length < 6 ? landing.inkFaint : "#fff",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: loading || code.length < 6 ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Redeeming…" : "Redeem code"}
                </button>
              </form>
            </SignedIn>
          </>
        )}

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: landing.inkFaint }}>
          Need help? <a href="mailto:support@dyslexiawrite.com" style={{ color: landing.amber }}>support@dyslexiawrite.com</a>
          {" · "}
          <Link href="/terms" style={{ color: landing.amber }}>Terms</Link>
        </p>
      </div>
    </main>
  );
}
