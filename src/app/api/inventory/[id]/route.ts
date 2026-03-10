import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  isForSale: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await apiRequireAuth("OWNER");
  if (error) return error;

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = updateProductSchema.parse(body);

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check SKU uniqueness if changing
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await db.product.findUnique({ where: { sku: data.sku } });
      if (skuExists) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
      }
    }

    // Separate product fields from inventory fields
    const { quantity, reorderLevel, ...productFields } = data;

    const product = await db.$transaction(async (tx) => {
      // Update product fields if any provided
      if (Object.keys(productFields).length > 0) {
        await tx.product.update({
          where: { id },
          data: productFields,
        });
      }

      // Update inventory fields if any provided
      if (quantity !== undefined || reorderLevel !== undefined) {
        const inventoryData: { quantity?: number; reorderLevel?: number } = {};
        if (quantity !== undefined) inventoryData.quantity = quantity;
        if (reorderLevel !== undefined) inventoryData.reorderLevel = reorderLevel;

        await tx.inventoryItem.upsert({
          where: { productId: id },
          update: inventoryData,
          create: {
            productId: id,
            quantity: quantity ?? 0,
            reorderLevel: reorderLevel ?? 5,
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { inventoryItems: true },
      });
    });

    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await apiRequireAuth("OWNER");
  if (error) return error;

  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If product has order references, soft-delete by marking as not for sale
    if (product.orderItems.length > 0) {
      await db.product.update({
        where: { id },
        data: { isForSale: false },
      });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: "Product has order history and was marked as not for sale instead of deleted",
      });
    }

    // No references — delete inventory item and product
    await db.$transaction(async (tx) => {
      await tx.inventoryItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
