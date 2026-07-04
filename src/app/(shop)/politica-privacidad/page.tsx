import type { Metadata } from "next";

import { LegalPage } from "@/components/shop/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo MAGNÉTIC recopila, usa y protege tus datos personales.",
  alternates: { canonical: "/politica-privacidad" },
};

const UPDATED_AT = "3 de julio de 2026";

/**
 * TODO: confirmar con cliente — razón social/RUC del titular del tratamiento
 * (hoy se usa el nombre comercial "MAGNÉTIC") y si el banner de cookies
 * (CLAUDE.md §10) ya está implementado antes de publicar oficialmente.
 */
export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      updatedAt={UPDATED_AT}
      sections={[
        {
          heading: "1. Responsable del tratamiento",
          paragraphs: [
            `${siteConfig.name} ("nosotros", "la Tienda") es responsable del tratamiento de los datos personales que nos proporcionas al usar este sitio, de acuerdo con la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento.`,
          ],
        },
        {
          heading: "2. Qué datos recopilamos",
          paragraphs: [
            "Recopilamos los datos que nos proporcionas directamente al comprar, contactarnos o registrar un reclamo: nombre, correo electrónico, teléfono, dirección de envío y, si creas una cuenta, tu contraseña (almacenada de forma cifrada, nunca en texto plano).",
            "Los datos de tu tarjeta de pago NUNCA llegan a nuestros servidores: se envían directamente y de forma cifrada a nuestra pasarela de pagos (Izipay), certificada para procesar transacciones de forma segura.",
          ],
        },
        {
          heading: "3. Para qué usamos tus datos",
          paragraphs: [
            "Usamos tus datos para procesar y entregar tus pedidos, responder tus consultas y reclamos, enviarte comunicaciones sobre el estado de tu compra, y —solo si lo autorizas— enviarte novedades y promociones.",
          ],
        },
        {
          heading: "4. Tus derechos",
          paragraphs: [
            "Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO) sobre tus datos personales, así como solicitar la eliminación de tu cuenta y datos asociados, escribiéndonos a través de nuestra página de Contacto.",
          ],
        },
        {
          heading: "5. Cookies",
          paragraphs: [
            "Usamos cookies esenciales para el funcionamiento del sitio (por ejemplo, mantener tu sesión y tu carrito de compras). Si en el futuro incorporamos cookies de analítica o marketing, lo indicaremos mediante un aviso de consentimiento antes de activarlas.",
          ],
        },
        {
          heading: "6. Seguridad",
          paragraphs: [
            "Aplicamos medidas de seguridad razonables para proteger tus datos personales contra pérdida, uso indebido o acceso no autorizado, conforme a lo exigido por la normativa peruana vigente.",
          ],
        },
        {
          heading: "7. Contacto",
          paragraphs: [
            "Ante cualquier consulta sobre esta política o el tratamiento de tus datos, puedes escribirnos desde nuestra página de Contacto.",
          ],
        },
      ]}
    />
  );
}
