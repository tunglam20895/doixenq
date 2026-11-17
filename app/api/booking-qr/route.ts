import QRCode from "qrcode";
import { siteUrl } from "@/lib/site";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const url = new URL("/dat-xe", siteUrl);
  const svg = await QRCode.toString(url.href, {
    type: "svg", errorCorrectionLevel: "M", margin: 4, width: 800,
  });
  return new Response(svg, { headers: {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "no-store",
    ...(new URL(request.url).searchParams.has("download")
      ? { "Content-Disposition": 'attachment; filename="qr-dat-xe.svg"' } : {}),
  } });
}
