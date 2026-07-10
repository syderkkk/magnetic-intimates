import { Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  dni: "DNI",
  ce: "Carné de Extranjería",
  pasaporte: "Pasaporte",
};

interface ComplaintNotificationEmailProps {
  code: string;
  type: "reclamo" | "queja";
  customerName: string;
  email: string;
  phone?: string;
  documentType?: string;
  documentId?: string;
  detail: string;
}

/**
 * Aviso al negocio cuando entra un reclamo/queja (CLAUDE.md §9: "Nuevo
 * reclamo → Admin"). La respuesta al cliente debe darse dentro de 30 días
 * (CLAUDE.md §8 regla 9) — este correo es lo que dispara ese plazo.
 */
export function ComplaintNotificationEmail({
  code,
  type,
  customerName,
  email,
  phone,
  documentType,
  documentId,
  detail,
}: ComplaintNotificationEmailProps) {
  return (
    <EmailLayout
      preview={`Nuevo ${type} #${code} — Libro de Reclamaciones`}
      title={`Nuevo ${type === "reclamo" ? "reclamo" : "queja"} — #${code}`}
    >
      <Text style={{ margin: "0 0 6px" }}>
        <strong>Cliente:</strong> {customerName}
      </Text>
      <Text style={{ margin: "0 0 6px" }}>
        <strong>Correo:</strong> {email}
      </Text>
      {phone ? (
        <Text style={{ margin: "0 0 6px" }}>
          <strong>Teléfono:</strong> {phone}
        </Text>
      ) : null}
      {documentId ? (
        <Text style={{ margin: "0 0 6px" }}>
          <strong>Documento:</strong>{" "}
          {documentType ? DOCUMENT_TYPE_LABELS[documentType] ?? documentType : null} {documentId}
        </Text>
      ) : null}
      <Section style={{ backgroundColor: "#f7f4ef", borderRadius: 8, padding: "12px 16px", marginTop: 12 }}>
        <Text style={{ whiteSpace: "pre-wrap", margin: 0 }}>{detail}</Text>
      </Section>
      <Text style={{ marginTop: 16, fontSize: 13, color: "#6b5847" }}>
        Recuerda responder dentro de los 30 días calendario (Libro de Reclamaciones, INDECOPI).
      </Text>
    </EmailLayout>
  );
}

export default ComplaintNotificationEmail;
