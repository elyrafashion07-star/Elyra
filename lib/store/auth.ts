"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseEnvSet } from "@/lib/supabase/env";

type AuthState = {
  user: User | null;
  /** False until the first session read lands — lets the UI avoid flashing
   *  "Sign in" at someone who is actually signed in. */
  ready: boolean;
};

const useAuthStore = create<AuthState>()(() => ({ user: null, ready: false }));

/**
 * One Supabase subscription for the whole app, ref-counted so the last consumer
 * to unmount tears it down. `onAuthStateChange` emits INITIAL_SESSION as soon as
 * it is attached, so the current session arrives without an extra round trip.
 */
let consumers = 0;
let stop: (() => void) | null = null;

function start() {
  const { data } = createClient().auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ user: session?.user ?? null, ready: true });
  });
  return () => data.subscription.unsubscribe();
}

/**
 * Who is signed in, on the client.
 *
 * The session lives in a cookie, so this is only for display — every page and
 * server action still verifies the user server-side before trusting it.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const pathname = usePathname();

  useEffect(() => {
    // Without env vars there is no session to watch, and creating the client
    // throws. Settle as "signed out" so the UI stops waiting.
    if (!isSupabaseEnvSet()) {
      useAuthStore.setState({ ready: true });
      return;
    }

    consumers += 1;
    if (consumers === 1) stop = start();

    return () => {
      consumers -= 1;
      if (consumers === 0) {
        stop?.();
        stop = null;
      }
    };
  }, []);

  // Signing in and out happens in server actions, which set the cookie on their
  // response — the browser client never sees it happen, so it fires no event.
  // Re-reading the session on every navigation is what closes that gap; it hits
  // the cookie, not the network, so it is cheap enough to do per route change.
  useEffect(() => {
    if (!isSupabaseEnvSet()) return;

    let cancelled = false;
    void createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) useAuthStore.setState({ user: data.session?.user ?? null, ready: true });
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return { user, ready };
}

/** Best name we have for a user — falls back to the part before the @. */
export function displayName(user: User): string {
  const full = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  if (full) return full;
  return user.email?.split("@")[0] ?? "Account";
}

/** First name only, for tight spots like the header. */
export function firstName(user: User): string {
  return displayName(user).split(" ")[0];
}
