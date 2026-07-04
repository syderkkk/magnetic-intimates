import Link from "next/link";

import { getWhatsAppUrl } from "@/lib/whatsapp";

/** Glifo de WhatsApp (lucide no incluye íconos de marca). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11a15.9 15.9 0 0 1-1.6-.6c-2.82-1.22-4.66-4.06-4.8-4.25-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.29.57-.36.76-.36h.55c.18 0 .42-.07.65.5.25.58.83 2 .9 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.63-.14.26.1 1.63.77 1.91.91.29.14.48.22.55.34.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

/**
 * Botón flotante de WhatsApp, visible en todo el sitio (tabla de páginas
 * pendientes del cliente). No se renderiza si aún no hay número configurado
 * (`lib/whatsapp.ts`) — mejor no mostrar nada que mostrar un botón muerto.
 */
export function WhatsAppButton() {
  const href = getWhatsAppUrl(
    "Hola, quisiera más información sobre sus productos.",
  );
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="size-6" />
    </Link>
  );
}
