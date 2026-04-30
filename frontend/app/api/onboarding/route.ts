// this is just mock end point for testing
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      kind?: string;
      step?: string;
      errors?: unknown;
    };

    if (body.kind === "validation-error") {
      console.error("Onboarding validation error:", {
        step: body.step,
        errors: body.errors,
      });

      return NextResponse.json(
        {
          ok: false,
          kind: "validation-error",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const formData = await request.formData();
  const payloadRaw = formData.get("payload");
  const payload = typeof payloadRaw === "string" ? JSON.parse(payloadRaw) : null;
  const file = formData.get("photo");

  return NextResponse.json({
    ok: true,
    submittedAt: new Date().toISOString(),
    payload,
    file:
      file instanceof File
        ? {
            name: file.name,
            type: file.type,
            size: file.size,
          }
        : null,
  });
}
