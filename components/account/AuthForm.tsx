"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { AuthState } from "@/app/account/actions";

type Field = { name: string; label: string; type: string; autoComplete?: string; required?: boolean };

export default function AuthForm({
  title,
  intro,
  fields,
  submitLabel,
  footerText,
  footerLink,
  secondaryLink,
  action,
  next,
  initialError,
  initialNotice,
}: {
  title: string;
  intro: string;
  fields: Field[];
  submitLabel: string;
  /** Omit both to drop the footer — the reset form has nowhere useful to point. */
  footerText?: string;
  footerLink?: { label: string; href: string };
  /** Small right-aligned link under the fields, e.g. "Forgot password?". */
  secondaryLink?: { label: string; href: string };
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
  /** Shown before the form is submitted — e.g. a dead link bounced back here. */
  initialError?: string;
  initialNotice?: string;
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});
  const error = state.error ?? initialError;
  const notice = state.notice ?? initialNotice;

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-center text-3xl tracking-[0.04em] uppercase">{title}</h1>
      <p className="mt-3 text-center text-sm text-muted">{intro}</p>

      <form action={formAction} className="mt-8 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">
              {f.label}
            </span>
            <input
              name={f.name}
              type={f.type}
              // React 19 resets the form once the action settles, restoring each
              // input to its defaultValue. Seeding that from what was just
              // submitted is what stops a rejected sign-in from wiping the
              // email the user already typed. Passwords are deliberately absent
              // from state.values, so they clear — which is what you want.
              defaultValue={state.values?.[f.name] ?? ""}
              autoComplete={f.autoComplete}
              required={f.required ?? true}
              className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>
        ))}

        {secondaryLink ? (
          <p className="-mt-1 text-right">
            <Link
              href={secondaryLink.href}
              className="text-[12px] text-muted underline underline-offset-4 transition-colors hover:text-gold"
            >
              {secondaryLink.label}
            </Link>
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}{" "}
            {state.errorLink ? (
              <Link href={state.errorLink.href} className="font-semibold underline underline-offset-4">
                {state.errorLink.label}
              </Link>
            ) : null}
          </p>
        ) : null}

        {notice ? (
          <p role="status" className="border border-line bg-sand px-4 py-3 text-[13px] text-ink-soft">
            {notice}
          </p>
        ) : null}

        <Submit label={submitLabel} />
      </form>

      {footerText && footerLink ? (
        <p className="mt-6 text-center text-[13px] text-muted">
          {footerText}{" "}
          <Link href={footerLink.href} className="text-gold underline underline-offset-4">
            {footerLink.label}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 bg-ink py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}
