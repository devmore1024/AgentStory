import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StoryPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  if (tab === "short") {
    redirect("/memory");
  }

  redirect("/adventure");
}
