import { NextResponse } from "next/server";
import {
  AuthRequiredError,
  StoryExperienceMigrationError,
  ensureTodayPersonalLine
} from "@/lib/story-experience";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request
    .json()
    .catch(() => null)
    .then((value) => (value && typeof value === "object" ? value : null));
  const slug =
    payload && "slug" in payload && typeof payload.slug === "string" && payload.slug.length > 0 ? payload.slug : null;

  if (!slug) {
    return NextResponse.json(
      {
        ok: false,
        error: "Book slug is required."
      },
      {
        status: 400
      }
    );
  }

  try {
    const line = await ensureTodayPersonalLine(slug);

    if (!line) {
      return NextResponse.json(
        {
          ok: false,
          error: "Personal line not found."
        },
        {
          status: 404
        }
      );
    }

    return NextResponse.json({
      ok: true,
      threadId: line.threadId,
      episodeId: line.episodeId,
      generationState: line.generationState
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message
        },
        {
          status: 401
        }
      );
    }

    if (error instanceof StoryExperienceMigrationError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message
        },
        {
          status: 409
        }
      );
    }

    throw error;
  }
}
