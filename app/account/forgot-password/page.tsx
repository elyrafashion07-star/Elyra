import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AuthForm from "@/components/account/AuthForm";
import { requestPasswordReset } from "@/app/account/actions";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <Container className="py-16">
      <AuthForm
        title="Forgot Password"
        intro="Enter the email you signed up with and we'll send you a link to set a new password."
        action={requestPasswordReset}
        fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
        submitLabel="Send Reset Link"
        footerText="Remembered it?"
        footerLink={{ label: "Back to login", href: "/account/login" }}
      />
    </Container>
  );
}
