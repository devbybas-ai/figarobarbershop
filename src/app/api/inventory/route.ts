import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const products = await db.product.findMany({
    include: { inventoryItems: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}
