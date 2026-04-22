"use client";
 
import { useState } from "react";
 
export default function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
 
  async function handleSubmit() {
    if (!email) return;
 
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
 
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }
 
  return (
    <div className="bg-white rounded-2xl border border-[var(--card-border)] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-bold text-base">Weekly Digest</h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Get free food events in your inbox every week
      </p>
 
      {status === "success" ? (
        <div className="flex items-center gap-2 text-sm text-[var(--green-dark)] font-semibold bg-[var(--green-light)] px-4 py-3 rounded-xl">
          You are subscribed!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@sjsu.edu"
            className="w-full text-sm px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--cream)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/10 transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full text-sm font-bold px-5 py-2.5 rounded-xl bg-[var(--dark)] text-white hover:bg-[var(--dark)]/90 transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </div>
      )}
 
      {status === "error" && (
        <p className="text-xs text-red-500 mt-2 font-medium">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}
 