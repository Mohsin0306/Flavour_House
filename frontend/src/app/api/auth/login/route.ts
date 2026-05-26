import bcrypt from "bcryptjs";
import { dbExecute, ensureDb, rowVal } from "@/lib/server/db";
import { signAdminToken } from "@/lib/server/auth";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

export async function POST(req: Request) {
  await ensureDb();
  const { email, password } = await req.json();

  if (!email || !password) {
    return errorResponse("Email and password required");
  }

  const result = await dbExecute("SELECT * FROM admins WHERE email = ?", [email]);

  if (!result.rows.length) {
    return errorResponse("Invalid credentials", 401);
  }

  const admin = result.rows[0];
  const hash = String(rowVal(admin, "password_hash"));
  if (!bcrypt.compareSync(password, hash)) {
    return errorResponse("Invalid credentials", 401);
  }

  const payload = {
    id: Number(rowVal(admin, "id")),
    email: String(rowVal(admin, "email")),
    name: String(rowVal(admin, "name")),
  };

  const token = signAdminToken(payload);
  return jsonResponse({ token, admin: payload });
}
