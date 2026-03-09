import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const intakeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  preferredBarber: z.string().optional(),
  hairType: z.string().optional(),
  allergies: z.string().optional(),
  referral: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const data = intakeSchema.parse(body);

    // Check if client exists
    let client = await db.client.findUnique({
      where: { email: data.email },
    });

    const intakeData = {
      preferredBarber: data.preferredBarber,
      hairType: data.hairType,
      allergies: data.allergies,
      referral: data.referral,
    };

    if (client) {
      client = await db.client.update({
        where: { id: client.id },
        data: {
          phone: data.phone ?? client.phone,
          intakeCompleted: true,
          intakeData,
          notes: data.notes,
        },
      });
    } else {
      client = await db.client.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          intakeCompleted: true,
          intakeData,
          notes: data.notes,
        },
      });
    }

    return NextResponse.json({ success: true, clientId: client.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
