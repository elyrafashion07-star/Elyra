import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AuthForm from "@/components/account/AuthForm";
import { signIn } from "@/app/account/actions";

export const metadata: Metadata = { title: "Login" };

/** Codes the /auth/callback and /auth/confirm routes bounce back here. */
const LINK_ERRORS: Record<string, string> = {
  link_expired: "That link has expired or was already used. Sign in below, or request a fresh one.",
  otp_expired: "That confirmation link has expired. Register again to get a fresh one.",
  access_denied: "That confirmation link is no longer valid. Register again to get a fresh one.",
  invalid_link: "That link was incomplete. Please open the most recent email we sent you.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <Container className="py-16">
      <AuthForm
        title="Login"
        intro="Welcome back. Sign in to track orders and see your saved pieces."
        action={signIn}
        next={next}
        initialError={error ? (LINK_ERRORS[error] ?? "That link could not be verified.") : undefined}
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
        secondaryLink={{ label: "Forgot password?", href: "/account/forgot-password" }}
        submitLabel="Sign In"
        footerText="New here?"
        footerLink={{ label: "Create an account", href: "/account/register" }}
      />
    </Container>
  );
}
