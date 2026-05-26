"use client";

import Link from "next/link";
import type { Restaurant } from "@/lib/api";
import { formatDistance } from "@/lib/format";

type Props = {
  branches: Restaurant[];
  nearestId?: number;
};

export default function BranchesSection({ branches, nearestId }: Props) {
  return (
    <section id="branches" className="scroll-mt-20 px-4 py-8">
      <h2 className="text-lg font-semibold text-neutral-900">All Branches</h2>
      <p className="mt-1 text-sm text-neutral-500">Lahore, Sialkot, Gujranwala, Bahawalpur, Okara & Kasur</p>
      <ul className="mt-4 space-y-3">
        {branches.map((b) => {
          const isNearest = b.id === nearestId;
          return (
            <li key={b.id}>
              <Link
                href={`/branches/${b.id}`}
                className={`block rounded-xl border p-4 transition hover:shadow-md ${
                  isNearest
                    ? "border-amber-300 bg-amber-50/50"
                    : "border-neutral-100 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {b.city ?? b.name}
                    </p>
                    <p className="text-xs text-neutral-500">{b.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{b.address}</p>
                  </div>
                  {isNearest && (
                    <span className="shrink-0 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Nearest
                    </span>
                  )}
                </div>
                {b.distance_km != null && (
                  <p className="mt-2 text-xs font-medium text-neutral-600">
                    {formatDistance(b.distance_km)}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-amber-700">View branch details →</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
