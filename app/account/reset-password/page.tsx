import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import AuthForm from "@/components/account/AuthForm";
import { updatePassword } from "@/app/account/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Set a New Password" };

/**
 * Where the recovery link lands, once /auth/callback (or /auth/confirm) has
 * turned the token into a session.
 *
 * Middleware already blocks this route without a session, so arriving here
 * means the link checked out. Someone signed in normally can also use it to
 * change their password — same form, same action.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account/login?error=link_expired");

  return (
    <Container className="py-16">
      <AuthForm
        title="Set a New Password"
        intro={`Choose a new password for ${user.email}. You'll stay signed in on this device.`}
        action={updatePassword}
        fields={[
          { name: "password", label: "New Password", type: "password", autoComplete: "new-password" },
          { name: "confirm", label: "Confirm Password", type: "password", autoComplete: "new-password" },
        ]}
        submitLabel="Update Password"
      />
    </Container>
  );
}
