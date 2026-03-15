import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const fileName = decoded.endsWith(".png") ? decoded : `${decoded}.png`;
  const filePath = path.join(process.cwd(), "images", "covers", fileName);

  try {
    const buffer = await readFile(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
