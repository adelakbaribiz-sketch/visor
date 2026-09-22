"use client";

// Demo-grade, client-side-only session handling for the frontend shell.
//
// This is NOT the real auth system. It exists so the dashboard UI has
// something to gate behind while being demoed with mock data and no
// backend running. The actual, verifiable JWT auth (bcrypt password
// hashing, signed tokens, role guard on a protected endpoint) lives in
// api/src/auth and is exercised against a real Postgres database — see
// docs/SECURITY.md and docs/DEMO.md for what was actually run and checked.
//
// Session state here is stored in localStorage, is trivially bypassable,
// and must never be treated as a security boundary.

import { DEMO_USERS } from "./data/fixtures";
import type { User } from "./data/types";

const STORAGE_KEY = "visor.demo.session";

export interface DemoSession {
  userId: string;
  loggedInAt: string;
}

export function login(email: string, password: string): User | null {
  // Any password is accepted for the seeded demo emails — this is a demo
  // shell, not an auth check. Real credential verification only happens
  // in the NestJS API (bcrypt compare + signed JWT).
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!user || password.length === 0) return null;

  const session: DemoSession = {
    userId: user.id,
    loggedInAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage can throw in private-mode/blocked contexts; the caller
    // will simply see the login as not persisted.
  }
  return user;
}

export function logout(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as DemoSession;
    return DEMO_USERS.find((u) => u.id === session.userId) ?? null;
  } catch {
    return null;
  }
}
