import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { productName } from "@/themes/theme.config";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <AuthFormPanel
      title="Create account"
      subtitle={
        <>
          Join <span className="font-semibold text-primary">{productName}</span> today
        </>
      }
    >
      <RegisterForm />
    </AuthFormPanel>
  );
}
