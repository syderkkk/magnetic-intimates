interface LegalSection {
  heading?: string;
  paragraphs: string[];
}

interface LegalPageProps {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}

/**
 * Layout compartido de las páginas legales (privacidad, términos, envíos,
 * devoluciones): mismo patrón de lectura para las cuatro (docs/09 §1.4,
 * consistencia). El aviso de revisión legal es intencional — ver
 * docs/06-identidad-magnetic.md y CLAUDE.md §10; estos textos son un modelo
 * general, no asesoría legal.
 */
export function LegalPage({ title, updatedAt, sections }: LegalPageProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Última actualización: {updatedAt}
      </p>

      <p className="mt-6 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground italic">
        Este documento es un modelo general para comercio electrónico en Perú.
        Se recomienda su revisión por un asesor legal antes de la operación
        oficial de la tienda.
      </p>

      <div className="mt-8 space-y-8">
        {sections.map((section, index) => (
          <div key={index}>
            {section.heading ? (
              <h2 className="text-base font-semibold tracking-tight">
                {section.heading}
              </h2>
            ) : null}
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
