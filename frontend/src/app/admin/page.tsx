"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    restaurants: number;
    menuItems: number;
    locations: number;
    recentLocations: Array<{
      latitude: number;
      longitude: number;
      created_at: string;
    }>;
  } | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    getAdminStats(token).then(setStats).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1">Overview of your restaurant platform</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <StatCard label="Restaurants" value={stats?.restaurants ?? "—"} icon="🍽️" />
        <StatCard label="Menu Items" value={stats?.menuItems ?? "—"} icon="📋" />
        <StatCard label="User Locations" value={stats?.locations ?? "—"} icon="📍" />
      </div>

      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent User Locations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Locations captured when visitors allow access on the website
        </p>
        {!stats?.recentLocations?.length ? (
          <p className="mt-4 text-gray-400 text-sm">No locations recorded yet</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Latitude</th>
                  <th className="pb-2 pr-4">Longitude</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLocations.map((loc, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-mono">{loc.latitude.toFixed(6)}</td>
                    <td className="py-2 pr-4 font-mono">{loc.longitude.toFixed(6)}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(loc.created_at + "Z").toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <span className="text-2xl">{icon}</span>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
