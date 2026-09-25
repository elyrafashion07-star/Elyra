"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Truck } from "lucide-react";

/** Shiprocket's public tracking page — works for every courier they assign. */
export function shiprocketTrackingUrl(awb: string): string {
  return `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
}

/**
 * The tracking number the courier gave the parcel, with a copy button and a
 * link out to Shiprocket's live tracking page.
 */
export default function AwbCard({ awb, courier }: { awb: string; courier?: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(awb);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, permissions) — the number is still
      // on screen to select by hand.
    }
  }

  return (
    <div className="mt-3 border border-line bg-cream p-4 text-[13px]">
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-muted">
        <Truck className="h-3.5 w-3.5" /> Tracking ID
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-semibold tracking-wide break-all text-ink select-all">{awb}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy tracking ID"
          className="flex shrink-0 items-center gap-1 text-[11px] text-ink-soft transition-colors hover:text-gold"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {courier ? <p className="mt-1 text-[12px] text-muted">Courier: {courier}</p> : null}

      <a
        href={shiprocketTrackingUrl(awb)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink underline underline-offset-4 transition-colors hover:text-gold"
      >
        Track live <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
