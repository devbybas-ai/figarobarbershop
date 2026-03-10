import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const sendIntakeSchema = z.object({
  clientId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const { error } = await apiRequireAuth("STAFF");
  if (error) return error;

  try {
    const body: unknown = await request.json();
    const { clientId } = sendIntakeSchema.parse(body);

    const client = await db.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.email) {
      return NextResponse.json({ error: "Client has no email on file" }, { status: 400 });
    }

    if (client.intakeCompleted) {
      return NextResponse.json({ error: "Client has already completed intake" }, { status: 400 });
    }

    // Build the intake URL with pre-filled email
    const baseUrl = request.nextUrl.origin;
    const intakeUrl = `${baseUrl}/intake?email=${encodeURIComponent(client.email)}&name=${encodeURIComponent(client.firstName)}`;

    // Try to send via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && resendKey !== "re_placeholder" && resendKey !== "re_") {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Figaro Barbershop <noreply@figaroleucadia.com>",
        to: client.email,
        subject: "Complete Your Intake Form - Figaro Barbershop",
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 30px;">
            <h2 style="color: #1a1a1a; margin-bottom: 8px;">Welcome to Figaro Barbershop</h2>
            <p style="color: #444; line-height: 1.6;">
              Hi ${client.firstName},<br><br>
              Please take a moment to complete your new client intake form so we can give you the best experience.
            </p>
            <a href="${intakeUrl}" style="display: inline-block; background: #c9a84c; color: #1a1a1a; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 2px; margin-top: 16px;">
              Complete Intake Form
            </a>
            <p style="color: #999; font-size: 13px; margin-top: 24px;">
              Figaro Barbershop Leucadia &middot; Encinitas, CA
            </p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, method: "email", intakeUrl });
    }

    // Resend not configured — return the link so staff can share it manually
    return NextResponse.json({ success: true, method: "link", intakeUrl });
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
