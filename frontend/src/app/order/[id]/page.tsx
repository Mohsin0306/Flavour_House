"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getOrder, type Order } from "@/lib/api";
import { formatPKR } from "@/lib/format";

const STEPS = [
  { key: "confirmed", label: "Order confirmed" },
  { key: "preparing", label: "Preparing your food" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

function stepIndex(status: string) {
  const map: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 1,
    out_for_delivery: 2,
    delivered: 3,
  };
  return map[status] ?? 0;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = Number(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    getOrder(id)
      .then((data) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order || order.status === "delivered") return;
    const statuses = ["confirmed", "preparing", "out_for_delivery", "delivered"];
    let i = stepIndex(order.status);
    const timer = setInterval(() => {
      i = Math.min(i + 1, statuses.length - 1);
      setOrder((o) => (o ? { ...o, status: statuses[i] } : o));
      if (i >= statuses.length - 1) clearInterval(timer);
    }, 8000);
    return () => clearInterval(timer);
  }, [order?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-amber-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafaf9] p-6 text-center">
        <p className="text-red-600">Order not found</p>
        <Link href="/" className="mt-4 inline-block text-amber-700">
          Home
        </Link>
      </div>
    );
  }

  const current = stepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-bold text-neutral-900">Order Placed!</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Order <span className="font-mono font-semibold text-neutral-800">{order.order_number}</span>
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-100 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Order status
          </p>
          <ol className="mt-4 space-y-4">
            {STEPS.map((step, i) => {
              const done = i <= current;
              const active = i === current;
              return (
                <li key={step.key} className="flex gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        active ? "text-neutral-900" : done ? "text-neutral-700" : "text-neutral-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-amber-700">In progress…</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-5 text-sm">
          <p className="font-semibold text-neutral-900">Delivery details</p>
          <div className="mt-3 space-y-1 text-neutral-600">
            <p>
              <span className="text-neutral-800">Branch:</span> {order.branch_name} ({order.branch_city})
            </p>
            <p>
              <span className="text-neutral-800">Name:</span> {order.customer_name}
            </p>
            <p>
              <span className="text-neutral-800">Phone:</span> {order.customer_phone}
            </p>
            <p>
              <span className="text-neutral-800">Address:</span> {order.delivery_address}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-5 text-sm">
          <p className="font-semibold text-neutral-900">Items</p>
          <ul className="mt-3 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-neutral-600">
                <span>
                  {item.quantity}× {item.item_name}
                </span>
                <span>{formatPKR(item.item_price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t pt-3 flex justify-between font-bold text-neutral-900">
            <span>Total paid</span>
            <span className="text-amber-700">{formatPKR(order.total)}</span>
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 block w-full rounded-xl bg-neutral-900 py-3.5 text-center text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}
