import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { Logo } from "@/components/shop/logo";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="text-3xl">
        <Logo />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Elegir nueva contraseña
          </h1>
        </div>
        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              El enlace no es válido.{" "}
              <Link href="/olvide-password" className="underline">
                Solicita uno nuevo
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
