"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const NAV = [
  { href: "/#menu", label: "Menu" },
  { href: "/#branches", label: "Branches" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
] as const;

type Props = {
  brandName?: string;
  onUpdateLocation?: () => void;
  showNav?: boolean;
};

export default function SiteHeader({
  brandName = "Flavor House",
  onUpdateLocation,
  showNav = true,
}: Props) {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100/80 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-4xl">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <Link href="/" className="min-w-0 truncate text-sm font-bold text-neutral-900">
            {brandName}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white"
              aria-label="Cart"
            >
              <svg className="h-4 w-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
            <Link
              href="/#menu"
              className="shrink-0 rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              Order
            </Link>
          </div>
        </div>

        {showNav && (
          <nav className="flex items-center gap-1 overflow-x-auto border-t border-neutral-50 px-2 py-1.5 scrollbar-hide">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
            {onUpdateLocation && (
              <button
                type="button"
                onClick={onUpdateLocation}
                className="ml-auto shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900"
              >
                Location
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
