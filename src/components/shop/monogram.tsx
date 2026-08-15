interface MonogramProps {
  className?: string;
}

/**
 * Monograma de marca: dos triángulos de trazo lineal enfrentados, formando una
 * "M" geométrica (dualidad femenino/masculino del manual, docs/06 §1).
 * Proporciones ajustadas al monograma del rediseño 2026-08-15 (más ancho que
 * alto: `public/brand/monograma.svg`, bbox medido con getBBox ≈295×251) pero
 * simplificado y engrosado a mano para leerse nítido a tamaños chicos (16-32px
 * del favicon) — el trazo fino del archivo del diseñador, pensado para verse
 * grande, se pierde por completo a esa escala. Recolor con `currentColor`
 * (className `text-*`); úsalo como símbolo suelto —el favicon
 * (`src/app/icon.tsx`) dibuja el mismo trazo por separado porque `next/og` no
 * puede importar componentes React.
 */
export function Monogram({ className }: MonogramProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <polygon
        points="6,10 6,54 32,32"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <polygon
        points="58,10 58,54 32,32"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
