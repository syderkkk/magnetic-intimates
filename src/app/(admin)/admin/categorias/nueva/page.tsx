import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { CategoryCreateForm } from "@/components/admin/category-create-form";

export const metadata: Metadata = { title: "Nueva categoría" };

export default function NewCategoryPage() {
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
        Nueva categoría
      </h1>

      <section className="max-w-md rounded-2xl border bg-background p-5 sm:p-6">
        <CategoryCreateForm />
      </section>
    </div>
  );
}
