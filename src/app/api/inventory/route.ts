import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  costPrice: z.number().min(0).optional(),
  isForSale: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
});

export async function GET() {
  const { error } = await apiRequireAuth("STAFF");
  if (error) return error;

  try {
    const products = await db.product.findMany({
      include: { inventoryItems: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await apiRequireAuth("OWNER");
  if (error) return error;

  try {
    const body: unknown = await request.json();
    const data = createProductSchema.parse(body);

    // Check SKU uniqueness if provided
    if (data.sku) {
      const existing = await db.product.findUnique({ where: { sku: data.sku } });
      if (existing) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
      }
    }

    const product = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          sku: data.sku,
          price: data.price,
          costPrice: data.costPrice,
          isForSale: data.isForSale ?? false,
        },
      });

      await tx.inventoryItem.create({
        data: {
          productId: created.id,
          quantity: data.quantity ?? 0,
          reorderLevel: data.reorderLevel ?? 5,
        },
      });

      return tx.product.findUnique({
        where: { id: created.id },
        include: { inventoryItems: true },
      });
    });

    return NextResponse.json(product, { status: 201 });
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
