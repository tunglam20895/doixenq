import { backend } from "@/lib/supabase/backend";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const photo = await backend<{
      data: string | null;
      active: boolean;
      published: boolean;
    } | null>("driver_photo", { id });
    if (!photo?.data || !photo.active || !photo.published)
      return new Response(null, { status: 404 });
    const m = photo.data.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!m) return new Response(null, { status: 404 });
    return new Response(Buffer.from(m[2], "base64"), {
      headers: {
        "Content-Type": m[1],
        "Cache-Control": "public,max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
