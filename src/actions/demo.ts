"use server";

import { cookies } from "next/headers";

const DEMO_COOKIE = "clientry_demo";

export interface DemoSession {
  role: "user" | "manager" | "admin";
}

/**
 * Start a demo session by setting a cookie with the chosen role.
 * No Supabase auth required — getCurrentUser() checks this cookie.
 */
export async function startDemoSession(
  role: "user" | "manager"
): Promise<void> {
  const cookieStore = await cookies();
  const session: DemoSession = { role };
  cookieStore.set(DEMO_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
}

/**
 * End the demo session by clearing the cookie.
 */
export async function endDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}

/**
 * Read the demo session from cookies.
 * Returns null if no demo session is active.
 */
export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as DemoSession;
    if (parsed.role === "user" || parsed.role === "manager" || parsed.role === "admin") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
