"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AuthRequiredError,
  StoryExperienceMigrationError,
  continueAdventure,
  joinAdventure,
  publishCompanionFromPersonal,
  startOrOpenPersonalLine
} from "@/lib/story-experience";

function revalidateStoryExperiencePaths() {
  revalidatePath("/");
  revalidatePath("/memory");
  revalidatePath("/adventure");
  revalidatePath("/me");
  revalidatePath("/story");
  revalidatePath("/discover");
}

export async function startOrOpenPersonalLineAction(formData: FormData) {
  const slug = formData.get("slug");

  if (typeof slug !== "string" || slug.length === 0) {
    throw new Error("Book slug is required.");
  }

  try {
    const result = await startOrOpenPersonalLine(slug);
    revalidateStoryExperiencePaths();
    revalidatePath(`/memory/${slug}`);
    redirect(`/memory/${result.slug}`);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/me?auth=required");
    }
    if (error instanceof StoryExperienceMigrationError) {
      redirect("/me?setup=story_schema_required");
    }
    throw error;
  }
}

export async function createAdventureAction(formData: FormData) {
  return startOrOpenPersonalLineAction(formData);
}

export async function publishCompanionFromPersonalAction(formData: FormData) {
  const originEpisodeId = formData.get("originEpisodeId");

  if (typeof originEpisodeId !== "string" || originEpisodeId.length === 0) {
    throw new Error("originEpisodeId is required.");
  }

  try {
    const result = await publishCompanionFromPersonal(originEpisodeId);
    revalidateStoryExperiencePaths();
    redirect(`/adventure/${result.threadId}`);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/me?auth=required");
    }
    if (error instanceof StoryExperienceMigrationError) {
      redirect("/me?setup=story_schema_required");
    }
    throw error;
  }
}

export async function joinAdventureAction(formData: FormData) {
  const threadId = formData.get("threadId");

  if (typeof threadId !== "string" || threadId.length === 0) {
    throw new Error("threadId is required.");
  }

  try {
    await joinAdventure(threadId);
    revalidateStoryExperiencePaths();
    redirect(`/adventure/${threadId}`);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/me?auth=required");
    }
    if (error instanceof StoryExperienceMigrationError) {
      redirect("/me?setup=story_schema_required");
    }
    throw error;
  }
}

export async function continueAdventureAction(formData: FormData) {
  const threadId = formData.get("threadId");

  if (typeof threadId !== "string" || threadId.length === 0) {
    throw new Error("threadId is required.");
  }

  try {
    await continueAdventure(threadId);
    revalidateStoryExperiencePaths();
    redirect(`/adventure/${threadId}`);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/me?auth=required");
    }
    if (error instanceof StoryExperienceMigrationError) {
      redirect("/me?setup=story_schema_required");
    }
    throw error;
  }
}
