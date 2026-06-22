import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { removeCategoryImage, updateCategoryImage } from "@/actions/categories";
import { CategoryEditForm } from "@/components/admin/category-edit-form";
import { ImageUploader } from "@/components/admin/image-uploader";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: category ? `Categoría — ${category.name}` : "Categoría" };
}

export default async function CategoryEditPage({ params }: Props) {
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <Link
        href="/admin/categorias"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Categorías
      </Link>
      <h1 className="mt-3 mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {category.name}
      </h1>

      <div className="max-w-md space-y-6">
        <section className="rounded-2xl border bg-background p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
            Datos
          </h2>
          <CategoryEditForm
            category={{
              id: category.id,
              name: category.name,
              description: category.description,
              isActive: category.isActive,
            }}
          />
        </section>

        <section className="rounded-2xl border bg-background p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold tracking-wide uppercase">
            Imagen
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Se muestra en la sección Explora por categoría del inicio.
          </p>
          <ImageUploader
            currentUrl={category.imageUrl}
            alt={category.name}
            fields={{ categoryId: category.id }}
            uploadAction={updateCategoryImage}
            removeAction={removeCategoryImage}
            aspectClass="aspect-3/4"
          />
        </section>
      </div>
    </div>
  );
}
