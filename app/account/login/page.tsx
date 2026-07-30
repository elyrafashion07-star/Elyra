import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AuthForm from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <Container className="py-16">
      <AuthForm
        title="Login"
        intro="Welcome back. Sign in to track orders and see your saved pieces."
        fields={[
          { name: "email", label: "Email", type: "email" },
          { name: "password", label: "Password", type: "password" },
        ]}
        submitLabel="Sign In"
        footerText="New here?"
        footerLink={{ label: "Create an account", href: "/account/register" }}
      />
    </Container>
  );
}
