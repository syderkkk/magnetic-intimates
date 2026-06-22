"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { clientIp, getAdminSession } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/data/filters";
import { db } from "@/lib/db";
import { ImageValidationError } from "@/lib/images";
import { deleteFileByUrl } from "@/lib/storage";
import { saveUploadedImage } from "@/lib/upload";
import type { ActionResult } from "@/types/action";

/** Revalida las vistas que muestran categorías. */
function revalidateCategories(id?: string) {
  revalidatePath("/admin/categorias");
  if (id) revalidatePath(`/admin/categorias/${id}`);
  revalidatePath("/");
  revalidatePath("/tienda");
}

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().max(300, "Máximo 300 caracteres").optional(),
});

const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1),
  isActive: z.boolean(),
});

/** Crea una categoría y redirige a su edición (para añadir su imagen). */
export async function createCategory(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const last = await db.category.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });

  let createdId: string;
  try {
    const created = await db.category.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        description: parsed.data.description?.length
          ? parsed.data.description
          : null,
        position: (last?.position ?? -1) + 1,
      },
    });
    createdId = created.id;
  } catch {
    return { success: false, error: "No se pudo crear (¿nombre repetido?)." };
  }

  await recordAudit({
    userId: session.user.id,
    action: "created",
    entityType: "category",
    entityId: createdId,
    changes: { name: parsed.data.name },
    ipAddress: await clientIp(),
  });
  revalidateCategories();
  redirect(`/admin/categorias/${createdId}`);
}

/** Edita nombre, descripción y visibilidad de una categoría. */
export async function updateCategory(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const updated = await db.category.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        description: parsed.data.description?.length
          ? parsed.data.description
          : null,
        isActive: parsed.data.isActive,
      },
    });
    await recordAudit({
      userId: session.user.id,
      action: "updated",
      entityType: "category",
      entityId: updated.id,
      changes: { name: updated.name },
      ipAddress: await clientIp(),
    });
    revalidateCategories(parsed.data.id);
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo guardar (¿nombre repetido?)." };
  }
}

/** Sube/reemplaza la imagen de una categoría. */
export async function updateCategoryImage(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const categoryId = String(formData.get("categoryId") ?? "");
  const file = formData.get("file");
  if (!categoryId || !(file instanceof File)) {
    return { success: false, error: "Faltan datos." };
  }

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) return { success: false, error: "Categoría no encontrada." };

  let url: string;
  try {
    url = await saveUploadedImage(file, "categories");
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof ImageValidationError
          ? error.message
          : "No se pudo procesar la imagen.",
    };
  }

  if (category.imageUrl) await deleteFileByUrl(category.imageUrl);
  await db.category.update({
    where: { id: categoryId },
    data: { imageUrl: url },
  });

  await recordAudit({
    userId: session.user.id,
    action: "updated",
    entityType: "category_image",
    entityId: categoryId,
    changes: { url },
    ipAddress: await clientIp(),
  });

  revalidateCategories(categoryId);
  return { success: true };
}

/** Quita la imagen de una categoría. */
export async function removeCategoryImage(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) return { success: false, error: "Categoría no encontrada." };

  if (category.imageUrl) await deleteFileByUrl(category.imageUrl);
  await db.category.update({
    where: { id: categoryId },
    data: { imageUrl: null },
  });

  revalidateCategories(categoryId);
  return { success: true };
}

/** Elimina una categoría (solo si no tiene productos asociados). */
export async function deleteCategory(formData: FormData): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const id = String(formData.get("id") ?? "");
  const category = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return { success: false, error: "Categoría no encontrada." };
  if (category._count.products > 0) {
    return {
      success: false,
      error:
        "No se puede eliminar: tiene productos. Reasígnalos o desactívala.",
    };
  }

  if (category.imageUrl) await deleteFileByUrl(category.imageUrl);
  await db.category.delete({ where: { id } });
  await recordAudit({
    userId: session.user.id,
    action: "deleted",
    entityType: "category",
    entityId: id,
    changes: { name: category.name },
    ipAddress: await clientIp(),
  });
  revalidateCategories();
  redirect("/admin/categorias");
}

/** Reordena una categoría una posición arriba o abajo. */
export async function moveCategory(formData: FormData): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const all = await db.category.findMany({
    orderBy: { position: "asc" },
    select: { id: true, position: true },
  });
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) return { success: false, error: "Categoría no encontrada." };

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= all.length) return { success: true };

  const current = all[index];
  const neighbor = all[target];
  if (!current || !neighbor) return { success: true };
  await db.$transaction([
    db.category.update({
      where: { id: current.id },
      data: { position: neighbor.position },
    }),
    db.category.update({
      where: { id: neighbor.id },
      data: { position: current.position },
    }),
  ]);
  revalidateCategories();
  return { success: true };
}
