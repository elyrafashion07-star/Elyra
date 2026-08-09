import Container from "@/components/ui/Container";
import HashSession from "@/components/account/HashSession";

/**
 * Landing spot for the implicit half of the email flows — see HashSession.
 *
 * Nothing useful can be rendered on the server here: the only thing that
 * matters lives in the URL fragment, which the browser keeps to itself.
 */
export default async function AuthFinishPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <Container className="py-24">
      <HashSession next={target} />
    </Container>
  );
}
