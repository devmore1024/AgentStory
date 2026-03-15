"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthRequiredError, createNextSerialEpisode, createShortStoryForBookSlug, toggleDiscoverLike } from "@/lib/demo-app";

export async function createShortStoryAction(formData: FormData) {
  const slug = formData.get("slug");

  if (typeof slug !== "string" || slug.length === 0) {
    throw new Error("Book slug is required.");
  }

  try {
    await createShortStoryForBookSlug(slug);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/me?auth=required");
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/story");
  revalidatePath("/discover");
  revalidatePath("/me");

  redirect("/story?tab=short");
}

export async function toggleDiscoverLikeAction(formData: FormData) {
  const feedStoryId = formData.get("feedStoryId");

  if (typeof feedStoryId !== "string" || feedStoryId.length === 0) {
    throw new Error("feedStoryId is required.");
  }

  try {
    await toggleDiscoverLike(feedStoryId);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/me?auth=required");
    }
    throw error;
  }

  revalidatePath("/discover");
}

export async function createSerialEpisodeAction() {
  try {
    await createNextSerialEpisode(true);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/me?auth=required");
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/story");
  revalidatePath("/discover");
  revalidatePath("/me");

  redirect("/story");
}
