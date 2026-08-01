import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AuthForm from "@/components/account/AuthForm";
import { signUp } from "@/app/account/actions";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <Container className="py-16">
      <AuthForm
        title="Create Account"
        intro="Register to check out faster, save a wishlist and track every order."
        action={signUp}
        fields={[
          { name: "name", label: "Full Name", type: "text", autoComplete: "name" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", required: false },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
        ]}
        submitLabel="Register"
        footerText="Already have an account?"
        footerLink={{ label: "Login", href: "/account/login" }}
      />
    </Container>
  );
}
