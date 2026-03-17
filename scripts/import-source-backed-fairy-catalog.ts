import { sourceBackedFairyCatalog } from "../lib/fairy-source-backed-catalog";
import { sql } from "../lib/db";

async function main() {
  const { rows } = await sql<{ id: string }>(
    `
      SELECT id
      FROM story_categories
      WHERE key = 'fairy_tale'
      LIMIT 1
    `
  );

  const fairyCategoryId = rows[0]?.id;

  if (!fairyCategoryId) {
    throw new Error("Missing fairy_tale category.");
  }

  for (const book of sourceBackedFairyCatalog) {
    await sql(
      `
        INSERT INTO story_books (
          category_id,
          title,
          slug,
          summary,
          key_scenes,
          original_synopsis,
          story_content,
          source_site,
          source_title,
          source_url,
          source_license,
          popularity_rank,
          public_domain,
          is_active
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5::jsonb,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          TRUE,
          TRUE
        )
        ON CONFLICT (slug) DO UPDATE
        SET
          category_id = EXCLUDED.category_id,
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          key_scenes = EXCLUDED.key_scenes,
          original_synopsis = EXCLUDED.original_synopsis,
          story_content = EXCLUDED.story_content,
          source_site = EXCLUDED.source_site,
          source_title = EXCLUDED.source_title,
          source_url = EXCLUDED.source_url,
          source_license = EXCLUDED.source_license,
          popularity_rank = EXCLUDED.popularity_rank,
          public_domain = TRUE,
          is_active = TRUE,
          updated_at = NOW()
      `,
      [
        fairyCategoryId,
        book.displayTitleZh,
        book.slug,
        book.summary,
        JSON.stringify(book.keyScenes),
        book.originalSynopsis,
        book.storyContentZh,
        book.sourceSite,
        book.sourceTitle,
        book.sourceUrl,
        book.sourceLicense,
        book.popularityRank
      ]
    );
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
