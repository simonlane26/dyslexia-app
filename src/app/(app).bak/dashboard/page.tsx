// 1. Imports
"use client"; // Client component so hooks work

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { CSSProperties } from "react";
import Link from "next/link";

// 1. Main Dashboard Component
export default function DashboardPage() {
  return (
    <div style={styles.container}>
      <SignedIn>
        <DashboardContent />
      </SignedIn>

      <SignedOut>
        <div style={styles.signOutContainer}>
          <p>You are not signed in.</p>
          <Link href="/sign-in" style={styles.signInLink}>
            Sign In
          </Link>
        </div>
      </SignedOut>
    </div>
  );
}

// 2. Dashboard Content
function DashboardContent() {
  const { user } = useUser();

  return (
    <div style={styles.card}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          📘 Welcome, {user?.firstName || "Explorer"}!
        </h1>
        <UserButton />
      </header>

      <p style={styles.text}>
        This is your dashboard. You can add your app features here.
      </p>
    </div>
  );
}

// 3. Styles
const styles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: "900px",
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "1.8rem",
    margin: 0,
  },
  text: {
    fontSize: "1rem",
    marginTop: "1rem",
  },
  signOutContainer: {
    textAlign: "center",
    marginTop: "5rem",
  },
  signInLink: {
    display: "inline-block",
    padding: "0.5rem 1rem",
    background: "#0070f3",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    marginTop: "1rem",
  },
};
