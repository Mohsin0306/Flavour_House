"use client";

import { useEffect, useRef, useState } from "react";
import { getRestaurants, saveLocation, type Coordinates, type Restaurant } from "@/lib/api";
import { BRANCH_CITIES } from "@/lib/branches";
import { storeCoords } from "@/lib/location-storage";

type Props = {
  onSuccess: (coords: Coordinates, nearestBranch: Restaurant | null) => void;
};

export default function LocationGate({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Restaurant[]>([]);
  const autoPrompted = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    getRestaurants()
      .then((data) => setBranches(data.restaurants))
      .catch(() => {});
  }, []);

  const requestLocation = () => {
    setError(null);

    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        try {
          await saveLocation(coords);
        } catch {
          /* proceed */
        }

        storeCoords(coords);

        let nearest: Restaurant | null = null;
        try {
          const data = await getRestaurants(coords.latitude, coords.longitude);
          nearest = data.restaurants[0] ?? null;
        } catch {
          nearest = branches[0] ?? null;
        }

        setLoading(false);
        onSuccess(coords, nearest);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Location blocked. Tap Allow in the browser prompt or enable Location in settings."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location unavailable. Turn on GPS and try again.");
        } else {
          setError("Could not detect location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (autoPrompted.current) return;
    autoPrompted.current = true;
    const timer = setTimeout(requestLocation, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const branchByCity = (city: string) => branches.find((b) => b.city === city);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        className="relative z-10 flex w-full max-w-md max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-neutral-200 sm:hidden" />

        <div className="overflow-y-auto overscroll-contain px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50">
            <svg className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <h2 id="location-modal-title" className="text-center text-lg font-bold text-neutral-900">
            Find Your Nearest Branch
          </h2>
          <p className="mt-2 text-center text-xs leading-relaxed text-neutral-600">
            Allow location to match you with the closest branch in Punjab for faster delivery and
            pickup.
          </p>

          <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              We serve these cities
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {BRANCH_CITIES.map((city) => {
                const branch = branchByCity(city);
                return (
                  <div
                    key={city}
                    className="rounded-lg border border-white bg-white px-2.5 py-2 shadow-sm"
                  >
                    <p className="text-xs font-bold text-neutral-900">{city}</p>
                    {branch ? (
                      <p className="mt-0.5 text-[10px] text-neutral-500 line-clamp-2">
                        {branch.address}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[10px] text-neutral-400">Branch available</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-neutral-500">
            Tap <strong>Allow</strong> when your browser asks — we will pick your nearest city
            branch automatically.
          </p>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-[11px] text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={requestLocation}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Finding nearest branch…" : "Allow Location"}
          </button>
        </div>
      </div>
    </div>
  );
}
