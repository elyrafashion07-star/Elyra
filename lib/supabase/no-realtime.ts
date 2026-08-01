/**
 * supabase-js builds a RealtimeClient inside `createClient`, and that looks for a
 * global `WebSocket` at construction time. Node 20 has none, so any server-side or
 * script usage throws before a single query runs.
 *
 * Nothing in this app subscribes to realtime, so we hand it a placeholder
 * transport. It is only ever instantiated if someone calls `.channel()`, which
 * would then fail loudly — the right outcome if realtime is ever wanted.
 */
export const noRealtime = {
  transport: function UnavailableWebSocket() {
    throw new Error(
      "Supabase realtime is disabled in this app. Add a WebSocket implementation to lib/supabase/no-realtime.ts to enable it.",
    );
  } as never,
};
