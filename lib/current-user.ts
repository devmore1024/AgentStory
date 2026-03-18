import { cache } from "react";
import { getAuthSession, isAuthSessionExpired } from "@/lib/auth";
import { createAnimalPersona, type AnimalPersona } from "@/lib/animal-personas";
import { sql } from "@/lib/db";

type AnimalType = AnimalPersona["animalType"];

export type AppUserContext = {
  userId: string;
  secondMeUserId: string;
  animalProfileId: string;
  displayName: string;
  avatar: string | null;
  persona: AnimalPersona;
  isAuthenticated: boolean;
  source: "secondme" | "demo";
};

type UserProfileRow = {
  user_id: string;
  secondme_user_id: string;
  display_name: string;
  avatar: string | null;
  animal_profile_id: string | null;
  animal_type: AnimalType | null;
  animal_name: string | null;
  display_label: string | null;
  summary: string | null;
  expression_style: string | null;
  tendencies: unknown;
  values: unknown;
  dimension_scores: unknown;
  mapping_reason: string | null;
  story_preferences: unknown;
};

function toJson(value: unknown) {
  return JSON.stringify(value);
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeDimensionScores(value: unknown, fallback: AnimalPersona["dimensionScores"]) {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Record<string, unknown>;

  return {
    warmth: typeof candidate.warmth === "number" ? candidate.warmth : fallback.warmth,
    action: typeof candidate.action === "number" ? candidate.action : fallback.action,
    thinking: typeof candidate.thinking === "number" ? candidate.thinking : fallback.thinking,
    expression: typeof candidate.expression === "number" ? candidate.expression : fallback.expression
  };
}

function normalizeStoryPreferences(value: unknown, fallback: AnimalPersona) {
  if (!value || typeof value !== "object") {
    return {
      categories: fallback.recommendedCategories,
      styles: fallback.recommendedStyles
    };
  }

  const candidate = value as Record<string, unknown>;

  return {
    categories: normalizeStringArray(candidate.categories).length
      ? normalizeStringArray(candidate.categories)
      : fallback.recommendedCategories,
    styles: normalizeStringArray(candidate.styles).length
      ? normalizeStringArray(candidate.styles)
      : fallback.recommendedStyles
  };
}

function buildPersonaFromRow(row: UserProfileRow) {
  const animalType = row.animal_type ?? "fox";
  const basePersona = createAnimalPersona(animalType, row.mapping_reason ?? undefined);
  const preferences = normalizeStoryPreferences(row.story_preferences, basePersona);

  return {
    ...basePersona,
    animalName: row.animal_name ?? basePersona.animalName,
    displayLabel: row.display_label ?? basePersona.displayLabel,
    summary: row.summary ?? basePersona.summary,
    expressionStyle: row.expression_style ?? basePersona.expressionStyle,
    tendencies: normalizeStringArray(row.tendencies).length ? normalizeStringArray(row.tendencies) : basePersona.tendencies,
    values: normalizeStringArray(row.values).length ? normalizeStringArray(row.values) : basePersona.values,
    recommendedCategories: preferences.categories,
    recommendedStyles: preferences.styles,
    dimensionScores: normalizeDimensionScores(row.dimension_scores, basePersona.dimensionScores),
    mappingReason: row.mapping_reason ?? basePersona.mappingReason
  };
}

export async function getViewerContextBySecondMeUserId(secondMeUserId: string): Promise<AppUserContext | null> {
  return getViewerContextByField("u.secondme_user_id", secondMeUserId);
}

export async function getViewerContextByUserId(userId: string): Promise<AppUserContext | null> {
  return getViewerContextByField("u.id", userId);
}

async function getViewerContextByField(field: "u.secondme_user_id" | "u.id", value: string): Promise<AppUserContext | null> {
  const { rows } = await sql<UserProfileRow>(
    `
      SELECT
        u.id AS user_id,
        u.secondme_user_id,
        u.display_name,
        u.avatar,
        ap.id AS animal_profile_id,
        ap.animal_type,
        ap.animal_name,
        ap.display_label,
        ap.summary,
        ap.expression_style,
        ap.tendencies,
        ap.values,
        ap.dimension_scores,
        ap.mapping_reason,
        ap.story_preferences
      FROM users u
      LEFT JOIN animal_profiles ap ON ap.user_id = u.id
      WHERE ${field} = $1
      LIMIT 1
    `,
    [value]
  );

  const row = rows[0];

  if (!row || !row.animal_profile_id) {
    return null;
  }

  return {
    userId: row.user_id,
    secondMeUserId: row.secondme_user_id,
    animalProfileId: row.animal_profile_id,
    displayName: row.display_name,
    avatar: row.avatar,
    persona: buildPersonaFromRow(row),
    isAuthenticated: true,
    source: "secondme"
  };
}

export const getCurrentViewerContext = cache(async () => {
  const session = await getAuthSession();

  if (!session || isAuthSessionExpired(session)) {
    return null;
  }

  return getViewerContextBySecondMeUserId(session.secondMeUserId);
});

export async function upsertAuthenticatedViewer(params: {
  secondMeUserId: string;
  displayName: string;
  avatar?: string | null;
  persona: AnimalPersona;
  mappingVersion: string;
  mappingReason: string;
  confidenceScore: number;
  rawSecondMeProfile: unknown;
}) {
  const { rows: userRows } = await sql<{
    id: string;
  }>(
    `
      INSERT INTO users (secondme_user_id, display_name, avatar, onboarding_completed)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (secondme_user_id) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          avatar = EXCLUDED.avatar,
          onboarding_completed = TRUE,
          updated_at = NOW()
      RETURNING id
    `,
    [params.secondMeUserId, params.displayName, params.avatar ?? null]
  );

  const userId = userRows[0].id;

  const { rows: profileRows } = await sql<{ id: string }>(
    `
      INSERT INTO animal_profiles (
        user_id,
        animal_type,
        animal_name,
        display_label,
        summary,
        tendencies,
        values,
        expression_style,
        dimension_scores,
        story_preferences,
        mapping_version,
        mapping_reason,
        confidence_score,
        raw_secondme_profile
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::jsonb,
        $7::jsonb,
        $8,
        $9::jsonb,
        $10::jsonb,
        $11,
        $12,
        $13,
        $14::jsonb
      )
      ON CONFLICT (user_id) DO UPDATE
      SET animal_type = EXCLUDED.animal_type,
          animal_name = EXCLUDED.animal_name,
          display_label = EXCLUDED.display_label,
          summary = EXCLUDED.summary,
          tendencies = EXCLUDED.tendencies,
          values = EXCLUDED.values,
          expression_style = EXCLUDED.expression_style,
          dimension_scores = EXCLUDED.dimension_scores,
          story_preferences = EXCLUDED.story_preferences,
          mapping_version = EXCLUDED.mapping_version,
          mapping_reason = EXCLUDED.mapping_reason,
          confidence_score = EXCLUDED.confidence_score,
          raw_secondme_profile = EXCLUDED.raw_secondme_profile,
          updated_at = NOW()
      RETURNING id
    `,
    [
      userId,
      params.persona.animalType,
      params.persona.animalName,
      params.persona.displayLabel,
      params.persona.summary,
      toJson(params.persona.tendencies),
      toJson(params.persona.values),
      params.persona.expressionStyle,
      toJson(params.persona.dimensionScores),
      toJson({
        categories: params.persona.recommendedCategories,
        styles: params.persona.recommendedStyles
      }),
      params.mappingVersion,
      params.mappingReason,
      params.confidenceScore,
      toJson(params.rawSecondMeProfile)
    ]
  );

  await sql(
    `
      UPDATE users
      SET animal_profile_id = $1,
          updated_at = NOW()
      WHERE id = $2
    `,
    [profileRows[0].id, userId]
  );

  return getViewerContextBySecondMeUserId(params.secondMeUserId);
}
