import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";
import { Logo } from "@/components/shop/logo";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="text-3xl">
        <Logo />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escribe tu correo y te enviamos un enlace para elegir una nueva.
          </p>
        </div>
        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
