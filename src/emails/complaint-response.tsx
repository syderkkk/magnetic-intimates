import { Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

interface ComplaintResponseEmailProps {
  code: string;
  customerName: string;
  response: string;
}

/** Respuesta del negocio a un reclamo/queja del Libro de Reclamaciones. */
export function ComplaintResponseEmail({
  code,
  customerName,
  response,
}: ComplaintResponseEmailProps) {
  return (
    <EmailLayout
      preview={`Respuesta a tu reclamo #${code}`}
      title={`Respuesta a tu reclamo #${code}`}
    >
      <Text style={{ margin: "0 0 6px" }}>Hola {customerName},</Text>
      <Text style={{ margin: "0 0 12px" }}>
        Esta es nuestra respuesta a tu reclamo registrado en el Libro de
        Reclamaciones:
      </Text>
      <Section
        style={{
          backgroundColor: "#f7f4ef",
          borderRadius: 8,
          padding: "12px 16px",
        }}
      >
        <Text style={{ whiteSpace: "pre-wrap", margin: 0 }}>{response}</Text>
      </Section>
    </EmailLayout>
  );
}

export default ComplaintResponseEmail;
