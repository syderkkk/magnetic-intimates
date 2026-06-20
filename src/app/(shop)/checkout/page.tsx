import type { Metadata } from "next";

import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = {
  title: "Finalizar compra",
  // El checkout no debe indexarse ni aparecer en buscadores.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
