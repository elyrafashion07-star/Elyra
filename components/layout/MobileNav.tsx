"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, LogOut, User, X } from "lucide-react";
import SignOutForm from "@/components/account/SignOutForm";
import { site } from "@/data/site";
import { displayName, useAuth } from "@/lib/store/auth";
import type { NavItem } from "@/lib/types";

export default function MobileNav({
  nav,
  open,
  onClose,
}: {
  nav: NavItem[];
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user } = useAuth();

  // Lock body scroll while the drawer is open, same as CartDrawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 xl:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        // Off-screen links stay tabbable otherwise — `inert` keeps them out of the
        // tab order without killing the slide-out transition the way `hidden` would.
        inert={!open}
        className={`fixed top-0 left-0 z-50 flex h-dvh w-[86%] max-w-sm flex-col bg-cream transition-transform duration-300 xl:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-display text-lg tracking-[0.3em]">MENU</span>
          <button type="button" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {nav.map((item) => {
            const isOpen = expanded === item.label;
            return (
              <div key={item.label} className="border-b border-line/60">
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex-1 px-5 py-3.5 text-sm font-medium tracking-[0.08em] uppercase"
                  >
                    {item.label}
                  </Link>
                  {item.children ? (
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label}`}
                      onClick={() => setExpanded(isOpen ? null : item.label)}
                      className="px-5 py-3.5"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : null}
                </div>

                {item.children && isOpen ? (
                  <div className="bg-sand/60 pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={onClose}
                        className="block px-8 py-3 text-[13px] text-ink-soft"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-line px-5 py-3 text-sm">
          {user ? (
            <p className="truncate border-b border-line/60 pb-2.5 text-[13px]">
              <span className="text-muted">Signed in as </span>
              <span className="font-medium">{displayName(user)}</span>
            </p>
          ) : null}

          <Link href="/account" onClick={onClose} className="flex items-center gap-2 py-2.5">
            <User className="h-4 w-4" /> {user ? "My Account" : "Sign In"}
          </Link>
          <Link href="/wishlist" onClick={onClose} className="flex items-center gap-2 py-2.5">
            <Heart className="h-4 w-4" /> Wishlist
          </Link>

          {user ? (
            <SignOutForm onSubmitted={onClose}>
              <button type="submit" className="flex items-center gap-2 py-2.5">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </SignOutForm>
          ) : null}

          <p className="mt-3 text-xs text-muted">{site.phone}</p>
        </div>
      </aside>
    </>
  );
}
