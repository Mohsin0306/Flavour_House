"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SiteHeader from "./SiteHeader";
import { storeBranch } from "@/lib/branch-storage";
import LocationGate from "./LocationGate";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import MenuSection from "./MenuSection";
import NearestBranchBanner from "./NearestBranchBanner";
import BranchesSection from "./BranchesSection";
import {
  getRestaurant,
  getRestaurants,
  type Coordinates,
  type MenuItem,
  type Restaurant,
} from "@/lib/api";
import { clearStoredBranch } from "@/lib/branch-storage";
import { clearStoredCoords, getStoredCoords } from "@/lib/location-storage";
import { HERO_CAROUSEL_IMAGES } from "@/lib/hero-images";

export default function HomePage() {
  const [locationGranted, setLocationGranted] = useState(false);
  const [nearestBranch, setNearestBranch] = useState<Restaurant | null>(null);
  const [allBranches, setAllBranches] = useState<Restaurant[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadForCoords = useCallback(async (c: Coordinates) => {
    setLoading(true);
    setError(null);
    try {
      const { restaurants } = await getRestaurants(c.latitude, c.longitude);
      setAllBranches(restaurants);

      const nearest = restaurants[0];
      if (!nearest) {
        setError("No branches found near you.");
        setNearestBranch(null);
        setMenu([]);
        return;
      }

      setNearestBranch(nearest);
      const detail = await getRestaurant(nearest.id);
      setMenu(detail.menu);
    } catch (err) {
      console.error("Branch load failed:", err);
      try {
        const fallback = await getRestaurants();
        if (fallback.restaurants.length > 0) {
          setAllBranches(fallback.restaurants);
          const nearest = fallback.restaurants[0];
          setNearestBranch(nearest);
          const detail = await getRestaurant(nearest.id);
          setMenu(detail.menu);
          setError(null);
          return;
        }
      } catch {
        /* ignore secondary failure */
      }
      setError(
        "Could not load branches. Run: cd frontend → npm rebuild better-sqlite3 → npm run seed → npm run dev"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationSuccess = useCallback(
    async (c: Coordinates, nearest: Restaurant | null) => {
      setLocationGranted(true);
      if (nearest) {
        setNearestBranch(nearest);
        storeBranch(nearest);
      }
      await loadForCoords(c);
    },
    [loadForCoords]
  );

  useEffect(() => {
    const stored = getStoredCoords();
    if (stored) {
      setLocationGranted(true);
      loadForCoords(stored);
    }
  }, [loadForCoords]);

  const handleUpdateLocation = () => {
    clearStoredCoords();
    clearStoredBranch();
    setNearestBranch(null);
    setAllBranches([]);
    setMenu([]);
    setLocationGranted(false);
    setError(null);
  };

  const heroSlides: HeroSlide[] = useMemo(() => {
    return HERO_CAROUSEL_IMAGES.map((image, i) => {
      const item = menu[i];
      return {
        image,
        name: item?.name ?? `Signature Dish ${i + 1}`,
        price: item?.price,
      };
    });
  }, [menu]);

  const brandName = "Flavor House";

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <SiteHeader
        brandName={brandName}
        onUpdateLocation={locationGranted ? handleUpdateLocation : undefined}
      />

      <main className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-4xl">
        <HeroCarousel slides={heroSlides} />

        <div
          className={
            !locationGranted ? "pointer-events-none select-none opacity-40" : ""
          }
          aria-hidden={!locationGranted}
        >

          {locationGranted && nearestBranch && <NearestBranchBanner branch={nearestBranch} />}

          {locationGranted && loading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-amber-600" />
            </div>
          )}

          {locationGranted && error && (
            <p className="mx-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              {error}
            </p>
          )}

          <section id="about" className="scroll-mt-20 px-4 py-6">
            <h2 className="text-lg font-semibold text-neutral-900">About</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {nearestBranch?.description ??
                "Fresh food, made to order. Visit your nearest branch for the best experience."}
            </p>
          </section>

          <div id="menu" className="scroll-mt-20">
            {locationGranted && nearestBranch ? (
              <MenuSection menu={menu} branch={nearestBranch} />
            ) : (
              <section className="px-4 py-8">
                <h2 className="text-lg font-semibold text-neutral-900">Our Menu</h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Allow location to view menu for your nearest branch.
                </p>
              </section>
            )}
          </div>

          {locationGranted ? (
            <BranchesSection branches={allBranches} nearestId={nearestBranch?.id} />
          ) : (
            <section id="branches" className="scroll-mt-20 px-4 py-8">
              <h2 className="text-lg font-semibold text-neutral-900">Branches</h2>
              <p className="mt-2 text-sm text-neutral-500">Enable location to see your nearest branch.</p>
            </section>
          )}

          <section id="contact" className="scroll-mt-20 border-t border-neutral-100 px-4 py-8">
            <h2 className="text-lg font-semibold text-neutral-900">Contact</h2>
            {nearestBranch ? (
              <div className="mt-3 space-y-2 text-sm text-neutral-600">
                <p>
                  <span className="font-medium text-neutral-800">Branch:</span> {nearestBranch.name}
                </p>
                <p>
                  <span className="font-medium text-neutral-800">Address:</span> {nearestBranch.address}
                </p>
                {nearestBranch.phone && (
                  <p>
                    <span className="font-medium text-neutral-800">Phone:</span>{" "}
                    <a href={`tel:${nearestBranch.phone}`} className="text-amber-700">
                      {nearestBranch.phone}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">Available after location is enabled.</p>
            )}
          </section>
        </div>
      </main>

      <footer
        className={`border-t border-neutral-100 bg-white py-5 text-center ${
          !locationGranted ? "opacity-40" : ""
        }`}
      >
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
      </footer>

      {!locationGranted && <LocationGate onSuccess={handleLocationSuccess} />}
    </div>
  );
}
