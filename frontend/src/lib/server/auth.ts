import jwt from "jsonwebtoken";
import { errorResponse } from "./utils";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export type AdminPayload = { id: number; email: string; name: string };

export function signAdminToken(admin: AdminPayload) {
  return jwt.sign(admin, SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminPayload {
  return jwt.verify(token, SECRET) as AdminPayload;
}

export function getAdminFromRequest(req: Request): AdminPayload | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return verifyAdminToken(header.slice(7));
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request) {
  const admin = getAdminFromRequest(req);
  if (!admin) return { admin: null, error: errorResponse("Login required", 401) };
  return { admin, error: null };
}
