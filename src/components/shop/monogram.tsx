interface MonogramProps {
  className?: string;
}

/**
 * Monograma de marca: dos triángulos de trazo lineal enfrentados, formando una
 * "M" geométrica (dualidad femenino/masculino del manual, docs/06 §1). Recolor
 * con `currentColor` (className `text-*`); úsalo como símbolo suelto —el
 * favicon (`src/app/icon.tsx`) dibuja el mismo trazo por separado porque
 * `next/og` no puede importar componentes React.
 */
export function Monogram({ className }: MonogramProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <polygon
        points="6,6 6,58 32,32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <polygon
        points="58,6 58,58 32,32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
