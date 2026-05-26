"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MenuItem, Restaurant } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/format";

type Props = {
  menu: MenuItem[];
  branch: Restaurant;
};

export default function MenuSection({ menu, branch }: Props) {
  const { addItem } = useCart();
  const categories = useMemo(() => {
    const cats = [...new Set(menu.map((m) => m.category || "Menu"))];
    return cats.sort();
  }, [menu]);

  const [active, setActive] = useState<string>("All");
  const filtered =
    active === "All" ? menu : menu.filter((m) => (m.category || "Menu") === active);

  if (!menu.length) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">Menu coming soon.</p>
    );
  }

  return (
    <section className="px-4 py-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-neutral-900">Our Menu</h2>
        <p className="text-sm text-neutral-500">
          {branch.city} branch · prices in PKR
        </p>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        <CategoryPill label="All" active={active === "All"} onClick={() => setActive("All")} />
        {categories.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat}
            active={active === cat}
            onClick={() => setActive(cat)}
          />
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-neutral-100 bg-white p-3.5 shadow-sm"
          >
            <Link href={`/menu/${item.id}?branch=${branch.id}`} className="block">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 leading-snug">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <span className="mt-1.5 inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
                    {item.category}
                  </span>
                </div>
                <p className="shrink-0 text-sm font-bold text-amber-700">
                  {formatPKR(item.price)}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() =>
                addItem(
                  { id: branch.id, name: branch.name, city: branch.city },
                  {
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    category: item.category,
                  }
                )
              }
              className="mt-3 w-full rounded-lg border border-neutral-900 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-900 hover:text-white transition"
            >
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-neutral-900 text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}
