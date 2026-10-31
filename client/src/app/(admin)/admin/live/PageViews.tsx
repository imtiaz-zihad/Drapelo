"use client";

import { useEffect, useState } from "react";
import { api } from "../orders/lib";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Stats = {
  totalViews: number;
  todayViews: number;
  uniqueVisitors: number;
  uniqueToday: number;
  pages: {
    path: string;
    total: number;
    today: number;
    unique: number;
    uniqueToday: number;
  }[];
};

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function PageViews() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let stop = false;

    api<Stats>("/live/stats")
      .then((d) => !stop && setStats(d))
      .catch((e) => !stop && setError(e instanceof Error ? e.message : "Failed"));

    // product names for /product/<id> paths
    fetch(`${API}/products?limit=50`)
      .then((r) => r.json())
      .then((json) => {
        const list: { _id: string; name: string }[] = Array.isArray(json)
          ? json
          : (json.data ?? []);
        if (!stop) {
          setNames(Object.fromEntries(list.map((p) => [p._id, p.name])));
        }
      })
      .catch(() => {});

    return () => {
      stop = true;
    };
  }, []);

  const label = (path: string) => {
    if (path === "/") return "Home";
    if (path.startsWith("/product/")) {
      const id = path.replace("/product/", "");
      return names[id] ?? `Product …${id.slice(-6)}`;
    }
    if (path.startsWith("/category"))
      return `Category ${path.replace("/category", "")}`.trim();
    if (path === "/checkout") return "Checkout";
    if (path === "/track-order") return "Track order";
    return path;
  };

  const v = (n: number | undefined) => (stats ? (n ?? 0) : "–");

  return (
    <div className="space-y-4">
      <div className="grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Views today" value={v(stats?.todayViews)} />
        <Card label="Views lifetime" value={v(stats?.totalViews)} />
        <Card label="Unique today" value={v(stats?.uniqueToday)} />
        <Card label="Unique lifetime" value={v(stats?.uniqueVisitors)} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Page</th>
              <th className="px-4 py-3 text-right font-semibold">
                Today
                <span className="block normal-case tracking-normal opacity-70">
                  views · unique
                </span>
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                Lifetime
                <span className="block normal-case tracking-normal opacity-70">
                  views · unique
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {stats && stats.pages.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                  No views yet
                </td>
              </tr>
            )}
            {stats?.pages.map((p) => (
              <tr key={p.path} className="border-t border-border/60">
                <td className="px-4 py-3">
                  <span className="font-medium">{label(p.path)}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.path}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {p.today} · <span className="text-primary">{p.uniqueToday}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                  {p.total} · <span className="text-primary">{p.unique}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}