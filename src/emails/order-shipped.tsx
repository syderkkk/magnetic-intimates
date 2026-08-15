import { Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

interface OrderShippedEmailProps {
  orderNumber: number;
  customerName: string;
}

/** Aviso al comprador cuando su pedido pasa a "enviado" (CLAUDE.md §9). */
export function OrderShippedEmail({
  orderNumber,
  customerName,
}: OrderShippedEmailProps) {
  return (
    <EmailLayout
      preview={`Tu pedido #${orderNumber} fue enviado`}
      title={`¡Tu pedido #${orderNumber} está en camino!`}
    >
      <Text style={{ margin: "0 0 6px" }}>Hola {customerName},</Text>
      <Text style={{ margin: "0 0 6px" }}>
        Tu pedido #{orderNumber} ya salió de nuestro almacén y va rumbo a ti.
      </Text>
    </EmailLayout>
  );
}

export default OrderShippedEmail;
