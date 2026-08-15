import { Button, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import { PASSWORD_RESET_TTL_MINUTES } from "@/lib/password-reset";

interface PasswordResetEmailProps {
  resetUrl: string;
}

/** Enlace para restablecer contraseña, vence en 15 minutos (CLAUDE.md §7.6/§9). */
export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout
      preview="Restablece tu contraseña"
      title="Restablece tu contraseña"
    >
      <Text style={{ margin: "0 0 16px" }}>
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Este enlace vence en {PASSWORD_RESET_TTL_MINUTES} minutos.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: "#0e0e0d",
          color: "#f7f4ef",
          borderRadius: 100,
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Elegir nueva contraseña
      </Button>
      <Text style={{ marginTop: 20, fontSize: 13, color: "#6b5847" }}>
        Si no pediste este cambio, ignora este correo — tu contraseña actual
        sigue funcionando.
      </Text>
    </EmailLayout>
  );
}

export default PasswordResetEmail;
