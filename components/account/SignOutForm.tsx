"use client";

import { signOut } from "@/app/account/actions";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseEnvSet } from "@/lib/supabase/env";

/**
 * Sign out, and tell the browser about it too.
 *
 * The server action is what actually revokes the session, but the browser
 * Supabase client holds its own copy and would go on telling the header someone
 * is signed in until a full reload. A local sign-out alongside it fires
 * SIGNED_OUT, so the navbar updates with the redirect. `scope: "local"` because
 * the server action already revokes the token upstream.
 */
export default function SignOutForm({
  className,
  onSubmitted,
  children,
}: {
  className?: string;
  onSubmitted?: () => void;
  children: React.ReactNode;
}) {
  return (
    <form
      action={signOut}
      className={className}
      onSubmit={() => {
        if (isSupabaseEnvSet()) void createClient().auth.signOut({ scope: "local" });
        onSubmitted?.();
      }}
    >
      {children}
    </form>
  );
}
