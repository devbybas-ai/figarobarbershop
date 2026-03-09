import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";

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
