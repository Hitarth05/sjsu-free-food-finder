"use client";
 
import { useState, useEffect } from "react";
 
export default function PushNotifButton() {
  const [permission, setPermission] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >("default");
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as "default" | "granted" | "denied");
  }, []);
 
  async function subscribeToPush() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      setPermission(perm as "default" | "granted" | "denied");
 
      if (perm !== "granted") {
        setLoading(false);
        return;
      }
 
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
 
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
    } catch (error) {
      console.error("Push subscription failed:", error);
    }
    setLoading(false);
  }
 
  if (permission === "unsupported") return null;
 
  return (
    <div className="bg-white rounded-2xl border border-[var(--card-border)] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-bold text-base">Push Notifications</h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Get instant alerts when free food events are found
      </p>
 
      {permission === "granted" ? (
        <div className="flex items-center gap-2 text-sm text-[var(--green-dark)] font-semibold bg-[var(--green-light)] px-4 py-3 rounded-xl">
          Notifications enabled
        </div>
      ) : permission === "denied" ? (
        <p className="text-sm text-[var(--text-secondary)] bg-[var(--red-light)] px-4 py-3 rounded-xl">
          Notifications blocked. Enable them in your browser settings.
        </p>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          className="w-full text-sm font-bold px-5 py-3 rounded-xl bg-[var(--gold)] text-[var(--dark)] hover:bg-[var(--gold)]/85 transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? "Setting up..." : "Enable Notifications"}
        </button>
      )}
    </div>
  );
}
 