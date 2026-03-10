import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiRequireAuth } from "@/lib/auth-utils";
import { writeFile } from "fs/promises";
import { join } from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const { error, session } = await apiRequireAuth("STAFF");
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, WebP, or AVIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    // Generate safe filename: barber-{userId}-{timestamp}.{ext}
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `barber-${session.user.id}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "images", "barbers");
    const filePath = join(uploadDir, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const imageUrl = `/images/barbers/${safeName}`;
    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
