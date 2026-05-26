"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/format";

const DELIVERY_FEE = 150;

export default function CartPage() {
  const router = useRouter();
  const { items, branchName, branchCity, subtotal, updateQty, removeItem, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <SiteHeader showNav={false} />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-4xl">🛒</p>
          <h1 className="mt-4 text-lg font-bold text-neutral-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-neutral-500">Add items from the menu to get started.</p>
          <Link
            href="/#menu"
            className="mt-6 inline-block rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Browse Menu
          </Link>
        </main>
      </div>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-28">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-xl font-bold text-neutral-900">Your Cart</h1>
        {branchCity && (
          <p className="mt-1 text-sm text-neutral-500">
            {branchName} · {branchCity}
          </p>
        )}

        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.menuItemId}
              className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <Link
                    href={`/menu/${item.menuItemId}`}
                    className="font-medium text-neutral-900 hover:text-amber-700"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-neutral-500">{formatPKR(item.price)} each</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                    className="h-8 w-8 rounded-lg border"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                    className="h-8 w-8 rounded-lg border"
                  >
                    +
                  </button>
                </div>
                <p className="font-bold text-amber-700">
                  {formatPKR(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-neutral-100 bg-white p-4 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-neutral-600">
            <span>Delivery fee</span>
            <span>{formatPKR(DELIVERY_FEE)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t pt-3 font-bold text-neutral-900">
            <span>Total</span>
            <span>{formatPKR(total)}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-100 bg-white p-4">
        <div className="mx-auto flex max-w-lg gap-3">
          <Link
            href="/#menu"
            className="flex-1 rounded-xl border border-neutral-200 py-3 text-center text-sm font-semibold"
          >
            Add more
          </Link>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex-[2] rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white"
          >
            Checkout · {formatPKR(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
