import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AuthForm from "@/components/account/AuthForm";
import { signIn } from "@/app/account/actions";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Container className="py-16">
      <AuthForm
        title="Login"
        intro="Welcome back. Sign in to track orders and see your saved pieces."
        action={signIn}
        next={next}
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
        submitLabel="Sign In"
        footerText="New here?"
        footerLink={{ label: "Create an account", href: "/account/register" }}
      />
    </Container>
  );
}
