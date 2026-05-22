import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

function resolveCallbackUrl(raw: string | string[] | undefined): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }
  return raw;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = resolveCallbackUrl(params.callbackUrl);

  return (
    <AuthFormPanel
      title="Welcome back"
      subtitle={
        <>
          Sign in to continue building your{" "}
          <span className="font-semibold text-primary">Ciright Video</span>{" "}
          channel.
        </>
      }
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthFormPanel>
  );
}
