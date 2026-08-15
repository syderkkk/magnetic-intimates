"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { clientIp, getAdminSession } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { ImageValidationError } from "@/lib/images";
import { deleteFileByUrl } from "@/lib/storage";
import { saveUploadedImage } from "@/lib/upload";
import type { ActionResult } from "@/types/action";

const MAX_IMAGES_PER_PRODUCT = 6;

/** Revalida las vistas que muestran imágenes de un producto. */
function revalidateProduct(slug: string, id: string) {
  revalidatePath(`/admin/productos/${id}`);
  revalidatePath(`/producto/${slug}`);
  revalidatePath("/tienda");
  revalidatePath("/");
}

/**
 * Sube una imagen para un producto: valida → normaliza con sharp → guarda en el
 * storage → registra en `product_images`. La primera imagen queda como principal.
 */
export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No se recibió ningún archivo." };
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, name: true, _count: { select: { images: true } } },
  });
  if (!product) return { success: false, error: "Producto no encontrado." };
  if (product._count.images >= MAX_IMAGES_PER_PRODUCT) {
    return {
      success: false,
      error: `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto.`,
    };
  }

  let url: string;
  try {
    url = await saveUploadedImage(file, `products/${productId}`);
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "No se pudo procesar la imagen." };
  }

  const isFirst = product._count.images === 0;
  const created = await db.productImage.create({
    data: {
      productId,
      url,
      alt: product.name, // alt por defecto = nombre del producto; editable luego
      position: product._count.images,
      isPrimary: isFirst,
    },
  });

  await recordAudit({
    userId: session.user.id,
    action: "created",
    entityType: "product_image",
    entityId: created.id,
    changes: { productId, url },
    ipAddress: await clientIp(),
  });

  revalidateProduct(product.slug, productId);
  return { success: true };
}

/** Elimina una imagen (del storage y la BD); reasigna la principal si hacía falta. */
export async function deleteProductImage(imageId: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const image = await db.productImage.findUnique({
    where: { id: imageId },
    include: { product: { select: { slug: true } } },
  });
  if (!image) return { success: false, error: "Imagen no encontrada." };

  await deleteFileByUrl(image.url);
  await db.productImage.delete({ where: { id: imageId } });

  // Si era la principal, promover la primera imagen restante.
  if (image.isPrimary) {
    const next = await db.productImage.findFirst({
      where: { productId: image.productId },
      orderBy: { position: "asc" },
    });
    if (next) {
      await db.productImage.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  await recordAudit({
    userId: session.user.id,
    action: "deleted",
    entityType: "product_image",
    entityId: imageId,
    changes: { productId: image.productId, url: image.url },
    ipAddress: await clientIp(),
  });

  revalidateProduct(image.product.slug, image.productId);
  return { success: true };
}

/** Marca una imagen como principal (y desmarca las demás del producto). */
export async function setPrimaryImage(imageId: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const image = await db.productImage.findUnique({
    where: { id: imageId },
    include: { product: { select: { slug: true } } },
  });
  if (!image) return { success: false, error: "Imagen no encontrada." };

  await db.$transaction([
    db.productImage.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false },
    }),
    db.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    }),
  ]);

  revalidateProduct(image.product.slug, image.productId);
  return { success: true };
}

const altSchema = z.object({
  imageId: z.string().min(1),
  alt: z.string().trim().max(200, "Máximo 200 caracteres"),
});

/** Actualiza el texto alternativo (alt) de una imagen — accesibilidad + SEO. */
export async function updateImageAlt(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = altSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const image = await db.productImage.findUnique({
    where: { id: parsed.data.imageId },
    include: { product: { select: { slug: true } } },
  });
  if (!image) return { success: false, error: "Imagen no encontrada." };

  await db.productImage.update({
    where: { id: parsed.data.imageId },
    data: { alt: parsed.data.alt },
  });

  revalidateProduct(image.product.slug, image.productId);
  return { success: true };
}
