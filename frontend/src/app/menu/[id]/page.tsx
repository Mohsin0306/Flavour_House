"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getRestaurant, type MenuItem, type Restaurant } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/format";

export default function MenuItemPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = Number(params.id);
  const branchId = Number(searchParams.get("branch"));
  const { addItem } = useCart();

  const [branch, setBranch] = useState<Restaurant | null>(null);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Number.isNaN(itemId) || Number.isNaN(branchId)) return;
    getRestaurant(branchId)
      .then((data) => {
        setBranch(data.restaurant);
        const found = data.menu.find((m) => m.id === itemId);
        setItem(found ?? null);
      })
      .finally(() => setLoading(false));
  }, [itemId, branchId]);

  const handleAdd = () => {
    if (!branch || !item) return;
    addItem(
      { id: branch.id, name: branch.name, city: branch.city },
      { menuItemId: item.id, name: item.name, price: item.price, category: item.category },
      qty
    );
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-amber-600" />
      </div>
    );
  }

  if (!item || !branch) {
    return (
      <div className="min-h-screen bg-[#fafaf9] p-6 text-center">
        <p className="text-red-600">Item not found</p>
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
        <Link href="/#menu" className="text-xs text-amber-700">
          ← Back to menu
        </Link>

        <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase text-neutral-600">
            {item.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-neutral-900">{item.name}</h1>
          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.description}</p>
          )}
          <p className="mt-4 text-2xl font-bold text-amber-700">{formatPKR(item.price)}</p>

          <p className="mt-4 text-xs text-neutral-500">
            Serving from <strong>{branch.city}</strong> branch · {branch.address}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-700">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-lg border text-lg"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="h-9 w-9 rounded-lg border text-lg"
              >
                +
              </button>
            </div>
          </div>

          <p className="mt-4 text-right text-sm text-neutral-600">
            Line total: <strong>{formatPKR(item.price * qty)}</strong>
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-6 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white"
          >
            Add to Cart — {formatPKR(item.price * qty)}
          </button>
        </div>
      </main>
    </div>
  );
}
