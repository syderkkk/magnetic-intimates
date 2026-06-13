/**
 * Plantilla del grupo (shop): a diferencia del layout, se vuelve a montar en
 * cada navegación. Eso permite animar la entrada del contenido al cambiar de
 * apartado (p. ej. al ir a Tienda) sin re-renderizar cabecera, anuncios ni pie.
 * Se anula con movimiento reducido (motion-safe).
 */
export default function ShopTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:ease-out">
      {children}
    </div>
  );
}
