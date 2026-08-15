import { Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

interface OrderCancelledEmailProps {
  orderNumber: number;
  customerName: string;
  status: "cancelado" | "reembolsado";
}

/** Aviso al comprador cuando su pedido se cancela o reembolsa (CLAUDE.md §9). */
export function OrderCancelledEmail({
  orderNumber,
  customerName,
  status,
}: OrderCancelledEmailProps) {
  const verb = status === "cancelado" ? "cancelado" : "reembolsado";
  return (
    <EmailLayout
      preview={`Tu pedido #${orderNumber} fue ${verb}`}
      title={`Tu pedido #${orderNumber} fue ${verb}`}
    >
      <Text style={{ margin: "0 0 6px" }}>Hola {customerName},</Text>
      <Text style={{ margin: "0 0 6px" }}>
        Tu pedido #{orderNumber} fue {verb}.
        {status === "reembolsado"
          ? " El reembolso se procesará al medio de pago que usaste en la compra."
          : ""}
      </Text>
      <Text style={{ margin: "12px 0 0" }}>
        Si tienes dudas, responde a este correo y te ayudamos.
      </Text>
    </EmailLayout>
  );
}

export default OrderCancelledEmail;
