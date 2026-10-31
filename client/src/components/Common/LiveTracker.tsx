"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const INTERVAL = 20_000;

function getId(): string {
  try {
    let id = sessionStorage.getItem("live_id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("live_id", id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export default function LiveTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!API || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }

    const id = getId();

    const ping = () => {
      if (document.visibilityState !== "visible") return;
      fetch(`${API}/live/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, path: pathname }),
        keepalive: true,
      }).catch(() => {});
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