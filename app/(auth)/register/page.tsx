import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <AuthFormPanel
      title="Create account"
      subtitle={
        <>
          Join <span className="font-semibold text-primary">Ciright Video</span> today
        </>
      }
    >
      <RegisterForm />
    </AuthFormPanel>
  );
}
