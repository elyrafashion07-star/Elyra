import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AuthForm from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <Container className="py-16">
      <AuthForm
        title="Create Account"
        intro="Register to check out faster, save a wishlist and track every order."
        fields={[
          { name: "name", label: "Full Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "tel" },
          { name: "password", label: "Password", type: "password" },
        ]}
        submitLabel="Register"
        footerText="Already have an account?"
        footerLink={{ label: "Login", href: "/account/login" }}
      />
    </Container>
  );
}
