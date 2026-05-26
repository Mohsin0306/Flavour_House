import type { Restaurant } from "./api";

const KEY = "selected_branch";

export function getStoredBranch(): Restaurant | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Restaurant) : null;
  } catch {
    return null;
  }
}

export function storeBranch(branch: Restaurant) {
  localStorage.setItem(KEY, JSON.stringify(branch));
}

export function clearStoredBranch() {
  localStorage.removeItem(KEY);
}
