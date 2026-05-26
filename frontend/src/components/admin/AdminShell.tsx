"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminSession, getAdminToken, getAdminUser } from "@/lib/admin-auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/restaurants", label: "Restaurants" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const admin = getAdminUser();

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin_login");
    } else {
      setReady(true);
    }
  }, [router]);

  const logout = () => {
    clearAdminSession();
    router.push("/admin_login");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="relative flex w-64 shrink-0 flex-col bg-gray-900 text-white min-h-screen">
        <div className="border-b border-gray-800 p-6">
          <p className="text-lg font-bold">Restaurant Admin</p>
          <p className="text-xs text-gray-400">{admin?.email}</p>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-2.5 text-sm transition ${
                pathname === item.href
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-800 p-4">
          <Link href="/" className="block text-sm text-gray-400 hover:text-white mb-2">
            ← Public website
          </Link>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
