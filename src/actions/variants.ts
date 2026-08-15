"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { clientIp, getAdminSession } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/data/filters";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action";

/** Revalida la ficha pública del producto y su edición en el admin. */
async function revalidateVariant(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  revalidatePath(`/admin/productos/${productId}`);
  if (product) revalidatePath(`/producto/${product.slug}`);
  revalidatePath("/tienda");
}

/** Agrega una variante (talla × color) con su stock. SKU autogenerado. */
export async function addProductVariant(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const productId = String(formData.get("productId") ?? "");
  const sizeId = String(formData.get("sizeId") ?? "");
  const colorId = String(formData.get("colorId") ?? "");
  const stock = Number(formData.get("stock") ?? 0);

  if (!productId || !sizeId || !colorId) {
    return { success: false, error: "Elige talla y color." };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { success: false, error: "El stock debe ser un entero ≥ 0." };
  }

  const [product, size, color] = await Promise.all([
    db.product.findUnique({ where: { id: productId }, select: { slug: true } }),
    db.size.findUnique({ where: { id: sizeId } }),
    db.color.findUnique({ where: { id: colorId } }),
  ]);
  if (!product || !size || !color) {
    return { success: false, error: "Producto, talla o color no encontrado." };
  }

  const sku =
    `${product.slug}-${slugify(size.name)}-${slugify(color.name)}`.toUpperCase();

  try {
    const created = await db.productVariant.create({
      data: { productId, sizeId, colorId, stock, sku },
    });
    await recordAudit({
      userId: session.user.id,
      action: "created",
      entityType: "product_variant",
      entityId: created.id,
      changes: { productId, size: size.name, color: color.name, stock },
      ipAddress: await clientIp(),
    });
  } catch {
    return {
      success: false,
      error: "Esa combinación de talla y color ya existe.",
    };
  }

  await revalidateVariant(productId);
  return { success: true };
}

const stockSchema = z.object({
  variantId: z.string().min(1),
  stock: z.number().int("Entero").min(0, "Mínimo 0"),
});

/** Actualiza el stock de una variante (cambio manual → se audita). */
export async function updateVariantStock(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = stockSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Stock inválido.",
    };
  }

  const before = await db.productVariant.findUnique({
    where: { id: parsed.data.variantId },
  });
  if (!before) return { success: false, error: "Variante no encontrada." };

  await db.productVariant.update({
    where: { id: parsed.data.variantId },
    data: { stock: parsed.data.stock },
  });

  await recordAudit({
    userId: session.user.id,
    action: "updated",
    entityType: "product_variant",
    entityId: parsed.data.variantId,
    changes: { stock: { before: before.stock, after: parsed.data.stock } },
    ipAddress: await clientIp(),
  });

  await revalidateVariant(before.productId);
  return { success: true };
}

/** Elimina una variante (solo si no está en ningún carrito activo). */
export async function deleteProductVariant(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const variantId = String(formData.get("variantId") ?? "");
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
  });
  if (!variant) return { success: false, error: "Variante no encontrada." };

  const cartItemsCount = await db.cartItem.count({ where: { variantId } });
  if (cartItemsCount > 0) {
    return {
      success: false,
      error:
        "No se puede eliminar: está en el carrito de al menos un cliente. Espera a que expire o pon el stock en 0.",
    };
  }

  try {
    await db.productVariant.delete({ where: { id: variantId } });
  } catch {
    return { success: false, error: "No se pudo eliminar la variante." };
  }

  await recordAudit({
    userId: session.user.id,
    action: "deleted",
    entityType: "product_variant",
    entityId: variantId,
    changes: { productId: variant.productId, sku: variant.sku },
    ipAddress: await clientIp(),
  });

  await revalidateVariant(variant.productId);
  return { success: true };
}
