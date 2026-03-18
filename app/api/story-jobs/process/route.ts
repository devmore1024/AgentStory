import { NextResponse } from "next/server";
import { processQueuedAdventureGenerationJobs } from "@/lib/story-experience";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request
    .json()
    .catch(() => null)
    .then((value) => (value && typeof value === "object" ? value : null));
  const threadId =
    payload && "threadId" in payload && typeof payload.threadId === "string" && payload.threadId.length > 0
      ? payload.threadId
      : undefined;

  const result = await processQueuedAdventureGenerationJobs({
    threadId,
    limit: 1
  });

  return NextResponse.json(result);
}
