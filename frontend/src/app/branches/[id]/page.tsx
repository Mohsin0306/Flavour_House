"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getRestaurant, type MenuItem, type Restaurant } from "@/lib/api";
import { formatPKR } from "@/lib/format";
import { formatDistance } from "@/lib/format";

export default function BranchDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [branch, setBranch] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    getRestaurant(id)
      .then((data) => {
        setBranch(data.restaurant);
        setMenu(data.menu);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-amber-600" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-[#fafaf9] p-6 text-center">
        <p className="text-red-600">Branch not found</p>
        <Link href="/" className="mt-4 inline-block text-amber-700">
          ← Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <Link href="/#branches" className="text-xs text-amber-700">
          ← All branches
        </Link>

        <div className="mt-4 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            {branch.city} Branch
          </p>
          <h1 className="mt-1 text-xl font-bold text-neutral-900">{branch.name}</h1>
          <p className="mt-2 text-sm text-neutral-600">{branch.description}</p>
          <div className="mt-4 space-y-1 text-sm text-neutral-600">
            <p>📍 {branch.address}</p>
            {branch.phone && (
              <p>
                📞{" "}
                <a href={`tel:${branch.phone}`} className="text-amber-700">
                  {branch.phone}
                </a>
              </p>
            )}
            {branch.cuisine && <p>🍽 {branch.cuisine}</p>}
            {branch.distance_km != null && (
              <p className="font-medium text-amber-800">{formatDistance(branch.distance_km)}</p>
            )}
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Menu at this branch</h2>
        <ul className="mt-4 space-y-2">
          {menu.map((item) => (
            <li key={item.id}>
              <Link
                href={`/menu/${item.id}?branch=${branch.id}`}
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3.5"
              >
                <div>
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.category}</p>
                </div>
                <span className="text-sm font-bold text-amber-700">{formatPKR(item.price)}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/#menu"
          className="mt-6 block w-full rounded-xl bg-neutral-900 py-3.5 text-center text-sm font-semibold text-white"
        >
          Order from this branch
        </Link>
      </main>
    </div>
  );
}
