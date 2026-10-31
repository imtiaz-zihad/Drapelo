"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const INTERVAL = 20_000;

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

// per-tab id for "online now"
function getSessionId(): string {
  try {
    let id = sessionStorage.getItem("live_id");
    if (!id) {
      id = randomId();
      sessionStorage.setItem("live_id", id);
    }
    return id;
  } catch {
    return randomId();
  }
}

// per-browser id for "unique visitors" (kept until the visitor clears site data)
function getVisitorId(): string | undefined {
  try {
    let id = localStorage.getItem("vid");
    if (!id) {
      id = randomId();
      localStorage.setItem("vid", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

// Run once in your own browser's console to stop counting your visits:
//   localStorage.setItem("noTrack", "1")
function optedOut(): boolean {
  try {
    return localStorage.getItem("noTrack") === "1";
  } catch {
    return false;
  }
}

function post(endpoint: string, body: unknown) {
  fetch(`${API}/live/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

export default function LiveTracker() {
  const pathname = usePathname();
  const lastView = useRef<string | null>(null);

  useEffect(() => {
    if (!API || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }
    if (optedOut()) return;

    // 1) lifetime page view (+ unique visitor): once per page
    if (lastView.current !== pathname) {
      lastView.current = pathname;
      post("view", { path: pathname, vid: getVisitorId() });
    }

    // 2) live presence: every 20s while the tab is visible
    const id = getSessionId();
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      post("ping", { id, path: pathname });
    };

    ping();
    const timer = setInterval(ping, INTERVAL);
    document.addEventListener("visibilitychange", ping);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [pathname]);

  return null;
}