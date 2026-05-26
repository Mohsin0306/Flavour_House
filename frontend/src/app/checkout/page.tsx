"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/api";
import { formatPKR } from "@/lib/format";

const DELIVERY_FEE = 150;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, branchId, branchName, branchCity, subtotal, clearCart, itemCount } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9] p-6 text-center">
        <p className="text-neutral-600">Cart is empty</p>
        <Link href="/#menu" className="mt-4 inline-block text-amber-700">
          Go to menu
        </Link>
      </div>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    setLoading(true);
    setError(null);

    try {
      const { order } = await createOrder({
        restaurant_id: branchId,
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        notes: notes || undefined,
        items: items.map((i) => ({
          menu_item_id: i.menuItemId,
          quantity: i.quantity,
        })),
      });
      clearCart();
      router.push(`/order/${order.id}`);
    } catch {
      setError("Could not place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-8">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <Link href="/cart" className="text-xs text-amber-700">
          ← Back to cart
        </Link>
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Checkout</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {branchName}
          {branchCity ? ` · ${branchCity}` : ""}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="Your name"
              required
            />
          </Field>
          <Field label="Phone" required>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="+92 3XX XXXXXXX"
              required
            />
          </Field>
          <Field label="Delivery address" required>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full min-h-[80px] rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="House #, street, area, city"
              required
            />
          </Field>
          <Field label="Order notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full min-h-[60px] rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="Extra spicy, no onions, etc."
            />
          </Field>

          <div className="rounded-xl border border-neutral-100 bg-white p-4 text-sm">
            <p className="font-medium text-neutral-900">Order summary</p>
            <ul className="mt-2 space-y-1 text-neutral-600">
              {items.map((i) => (
                <li key={i.menuItemId} className="flex justify-between">
                  <span>
                    {i.quantity}× {i.name}
                  </span>
                  <span>{formatPKR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t pt-3 flex justify-between font-bold">
              <span>Total (incl. delivery)</span>
              <span className="text-amber-700">{formatPKR(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-900 py-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Placing order…" : `Place Order · ${formatPKR(total)}`}
          </button>
        </form>
      </main>

    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-neutral-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
      {children}
    </label>
  );
}
