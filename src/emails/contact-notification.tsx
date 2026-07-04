import { Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/** Aviso al negocio cuando alguien envía el formulario de Contacto. */
export function ContactNotificationEmail({
  name,
  email,
  phone,
  message,
}: ContactNotificationEmailProps) {
  return (
    <EmailLayout
      preview={`Nuevo mensaje de contacto de ${name}`}
      title="Nuevo mensaje de contacto"
    >
      <Text style={{ margin: "0 0 6px" }}>
        <strong>Nombre:</strong> {name}
      </Text>
      <Text style={{ margin: "0 0 6px" }}>
        <strong>Correo:</strong> {email}
      </Text>
      {phone ? (
        <Text style={{ margin: "0 0 6px" }}>
          <strong>Teléfono:</strong> {phone}
        </Text>
      ) : null}
      <Section style={{ backgroundColor: "#f7f4ef", borderRadius: 8, padding: "12px 16px", marginTop: 12 }}>
        <Text style={{ whiteSpace: "pre-wrap", margin: 0 }}>{message}</Text>
      </Section>
    </EmailLayout>
  );
}

export default ContactNotificationEmail;
