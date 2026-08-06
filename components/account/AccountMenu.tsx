"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, LogOut, User } from "lucide-react";
import SignOutForm from "@/components/account/SignOutForm";
import Tooltip from "@/components/layout/Tooltip";
import { displayName, firstName, useAuth } from "@/lib/store/auth";

/**
 * Header account control. Signed out (and while the session is still resolving)
 * it stays the plain icon link it has always been, so nothing shifts on load.
 */
export default function AccountMenu({ className = "" }: { className?: string }) {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ready || !user) {
    return (
      <Link href="/account" aria-label="Account" className={`group ${className}`}>
        <User strokeWidth={1.5} className="h-5.5 w-5.5 transition-colors group-hover:text-gold 2xl:h-6 2xl:w-6" />
        <Tooltip label="Account" />
      </Link>
    );
  }

  const name = displayName(user);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className={`group flex items-center gap-2 ${className}`}
      >
        <Initial name={name} />
        <span className="hidden max-w-28 truncate text-[13px] tracking-[0.04em] xl:inline">
          {firstName(user)}
        </span>
        {/* The open menu already sits right below the avatar — two panels there would collide. */}
        {open ? null : <Tooltip label="Account" />}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-3 min-w-60 border border-line bg-white py-2 shadow-xl"
        >
          <div className="border-b border-line px-5 pt-1 pb-3">
            <p className="truncate text-[13px] font-medium text-ink">{name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
          </div>

          <Item href="/account" icon={<User className="h-4 w-4" />} onClick={() => setOpen(false)}>
            My Account
          </Item>
          <Item href="/wishlist" icon={<Heart className="h-4 w-4" />} onClick={() => setOpen(false)}>
            Wishlist
          </Item>

          <SignOutForm className="border-t border-line pt-1" onSubmitted={() => setOpen(false)}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-5 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-sand hover:text-gold"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </SignOutForm>
        </div>
      ) : null}
    </div>
  );
}

function Item({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 px-5 py-2.5 text-[13px] text-ink-soft transition-colors hover:bg-sand hover:text-gold"
    >
      {icon} {children}
    </Link>
  );
}

/** Initial-letter avatar — keeps the header the same height as the icon it replaces. */
function Initial({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-cream 2xl:h-7.5 2xl:w-7.5"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
