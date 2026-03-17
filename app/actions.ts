"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AuthRequiredError,
  StoryExperienceMigrationError,
  continueAdventure,
  createAdventureForBookSlug,
  joinAdventure
} from "@/lib/story-experience";

function revalidateStoryExperiencePaths() {
  revalidatePath("/");
  revalidatePath("/adventure");
  revalidatePath("/me");
  revalidatePath("/story");
  revalidatePath("/discover");
}

export async function createAdventureAction(formData: FormData) {
  const slug = formData.get("slug");

  if (typeof slug !== "string" || slug.length === 0) {
    throw new Error("Book slug is required.");
  }

  try {
    const result = await createAdventureForBookSlug(slug);
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
