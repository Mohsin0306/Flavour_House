export const BRANCH_CITIES = [
  "Lahore",
  "Sialkot",
  "Gujranwala",
  "Bahawalpur",
  "Okara",
  "Kasur",
] as const;

export type BranchCity = (typeof BRANCH_CITIES)[number];
