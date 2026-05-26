import type { Coordinates } from "./api";

const KEY = "user_coordinates";

export function getStoredCoords(): Coordinates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Coordinates;
  } catch {
    return null;
  }
}

export function storeCoords(coords: Coordinates) {
  localStorage.setItem(KEY, JSON.stringify(coords));
}

export function clearStoredCoords() {
  localStorage.removeItem(KEY);
}
