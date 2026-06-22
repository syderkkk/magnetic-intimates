"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { recordAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { solesToCents } from "@/lib/money";
import type { ActionResult } from "@/types/action";

const ADMIN_ROLES = ["admin", "editor"];

const createProductSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Slug inválido: usa minúsculas, números y guiones"),
  categoryId: z.string().min(1, "Elige una categoría"),
  priceSoles: z.number().positive("El precio debe ser mayor a 0"),
  compareAtSoles: z.number().positive("Debe ser mayor a 0").nullable(),
  badge: z.enum(["nuevo", "bestseller", "oferta"]).nullable(),
  description: z.string().trim().optional(),
  isFeatured: z.boolean(),
});

/**
 * Crea un producto con lo básico y redirige a su edición para completar
 * variantes e imágenes. Nace INACTIVO (borrador) para no mostrarse en la tienda
 * hasta estar listo.
 */
export async function createProduct(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return { success: false, error: "No autorizado." };
  }

  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  let createdId: string;
  try {
    const created = await db.product.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        categoryId: parsed.data.categoryId,
        priceCents: solesToCents(parsed.data.priceSoles),
        compareAtPriceCents:
          parsed.data.compareAtSoles != null
            ? solesToCents(parsed.data.compareAtSoles)
            : null,
        badge: parsed.data.badge,
        description: parsed.data.description?.length
          ? parsed.data.description
          : null,
        isActive: false,
        isFeatured: parsed.data.isFeatured,
      },
    });
    createdId = created.id;
  } catch {
    return { success: false, error: "No se pudo crear (¿el slug ya existe?)." };
  }

  await recordAudit({
    userId: session.user.id,
    action: "created",
    entityType: "product",
    entityId: createdId,
    changes: { name: parsed.data.name, slug: parsed.data.slug },
    ipAddress:
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });
  revalidatePath("/admin/productos");

  redirect(`/admin/productos/${createdId}`);
}

const updateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Slug inválido: usa minúsculas, números y guiones"),
  categoryId: z.string().min(1, "Elige una categoría"),
  priceSoles: z.number().positive("El precio debe ser mayor a 0"),
  compareAtSoles: z
    .number()
    .positive("El precio anterior debe ser mayor a 0")
    .nullable(),
  badge: z.enum(["nuevo", "bestseller", "oferta"]).nullable(),
  description: z.string().trim().optional(),
  composition: z.string().trim().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

/** Campos auditados de un producto (para registrar antes/después). */
function auditSnapshot(p: {
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  badge: string | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
}) {
  return {
    name: p.name,
    slug: p.slug,
    priceCents: p.priceCents,
    compareAtPriceCents: p.compareAtPriceCents,
    badge: p.badge,
    categoryId: p.categoryId,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
  };
}

/**
 * Actualiza los campos base de un producto.
 * Patrón uniforme: validar permisos → validar input (Zod) → actualizar →
 * registrar en `audit_logs` → revalidar caché → devolver resultado tipado.
 */
export async function updateProduct(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return { success: false, error: "No autorizado." };
  }

  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const data = parsed.data;

  const before = await db.product.findUnique({ where: { id: data.id } });
  if (!before) return { success: false, error: "Producto no encontrado." };

  try {
    const after = await db.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        priceCents: solesToCents(data.priceSoles),
        compareAtPriceCents:
          data.compareAtSoles != null ? solesToCents(data.compareAtSoles) : null,
        badge: data.badge,
        description: data.description?.length ? data.description : null,
        composition: data.composition?.length ? data.composition : null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    });

    // Auditoría de negocio (CLAUDE.md §11.8): quién, qué y cambios (antes/después).
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await recordAudit({
      userId: session.user.id,
      action: "updated",
      entityType: "product",
      entityId: after.id,
      changes: { before: auditSnapshot(before), after: auditSnapshot(after) },
      ipAddress: ip,
    });

    // Revalida las vistas afectadas (admin + tienda pública).
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${after.id}`);
    revalidatePath(`/producto/${after.slug}`);
    if (before.slug !== after.slug) revalidatePath(`/producto/${before.slug}`);
    revalidatePath("/tienda");
    revalidatePath("/");

    return { success: true };
  } catch {
    // Causa más común: slug duplicado (restricción unique).
    return {
      success: false,
      error: "No se pudo guardar. Revisa que el slug no esté repetido.",
    };
  }
}
