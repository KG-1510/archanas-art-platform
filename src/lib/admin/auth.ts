import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

/**
 * Sign-in for the admin panel.
 *
 * Accounts live in the ADMIN_USERS environment variable, one per person, as
 * `name:salt:hash` entries separated by semicolons. The hash is scrypt, made by
 * `node scripts/admin-password.mjs`; the password itself is never stored.
 * A signed, HTTP-only cookie keeps the person signed in for 12 hours. It is
 * signed with ADMIN_SESSION_SECRET, so it cannot be forged or edited.
 */
const COOKIE = "aa_admin";
const SESSION_HOURS = 12;
const NAME = /^[a-z0-9_-]{2,32}$/;

type Account = { name: string; salt: Buffer; hash: Buffer };

function accounts(): Account[] {
  return (process.env.ADMIN_USERS ?? "")
    .split(";")
    .map((entry) => entry.trim().split(":"))
    .filter((p) => p.length === 3 && NAME.test(p[0]) && /^[0-9a-f]{32}$/.test(p[1]) && /^[0-9a-f]{128}$/.test(p[2]))
    .map(([name, salt, hash]) => ({ name, salt: Buffer.from(salt, "hex"), hash: Buffer.from(hash, "hex") }));
}

function sessionSecret() {
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  return s.length >= 32 ? s : null;
}

/** True once at least one account and the session secret are set. */
export function adminConfigured() {
  return accounts().length > 0 && sessionSecret() !== null;
}

// A fixed decoy so an unknown name costs the same time as a wrong password.
const DECOY = { salt: randomBytes(16), hash: randomBytes(64) };

export function checkPassword(name: string, password: string): string | null {
  const wanted = name.trim().toLowerCase();
  const account = accounts().find((a) => a.name === wanted);
  const { salt, hash } = account ?? DECOY;
  const given = scryptSync(password.slice(0, 200), salt, 64);
  return timingSafeEqual(given, hash) && account ? account.name : null;
}

const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("hex");

export async function startSession(name: string) {
  const secret = sessionSecret();
  if (!secret) return false;
  const expires = Date.now() + SESSION_HOURS * 3_600_000;
  const payload = `${name}.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    expires: new Date(expires),
  });
  return true;
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: 0 });
}

/** The signed-in person's name, or null. Checks the signature, the expiry and that the account still exists. */
export async function getAdmin(): Promise<string | null> {
  // A sign-in check always belongs to one request: never prerender or cache it.
  await connection();
  const secret = sessionSecret();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!secret || !raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [name, expires, signature] = parts;
  const expected = Buffer.from(sign(`${name}.${expires}`, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!(Number(expires) > Date.now())) return null;
  return accounts().some((a) => a.name === name) ? name : null;
}

/** For every admin page and every admin action: sends anyone not signed in to the login page. */
export async function requireAdmin(): Promise<string> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

// Slows password guessing. Per server instance, so it is a speed bump rather than a wall;
// the scrypt hash and a strong password are the real protection.
const attempts = new Map<string, { count: number; resetAt: number }>();
export function tooManyAttempts(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}
export function clearAttempts(key: string) {
  attempts.delete(key);
}
