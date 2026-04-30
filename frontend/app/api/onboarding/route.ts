import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const payloadRaw = formData.get("payload");
  const payload =
    typeof payloadRaw === "string" ? JSON.parse(payloadRaw) : null;
  const file = formData.get("modelPhoto");

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
