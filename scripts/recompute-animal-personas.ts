type AnimalProfileRow = {
  id: string;
  user_id: string;
  animal_type: string | null;
  mapping_version: string | null;
  raw_secondme_profile: unknown;
};

type RawSecondMeProfile = {
  userInfo?: {
    userId?: string;
    name?: string;
    avatar?: string | null;
    bio?: string | null;
    selfIntroduction?: string | null;
  };
  shades?: Array<Record<string, unknown>>;
  softMemory?: Array<Record<string, unknown>>;
};

function toJson(value: unknown) {
  return JSON.stringify(value);
}

function normalizeRawProfile(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as RawSecondMeProfile;

  if (!candidate.userInfo || typeof candidate.userInfo !== "object") {
    return null;
  }

  if (typeof candidate.userInfo.userId !== "string" || typeof candidate.userInfo.name !== "string") {
    return null;
  }

  return {
    userInfo: {
      userId: candidate.userInfo.userId,
      name: candidate.userInfo.name,
      avatar: typeof candidate.userInfo.avatar === "string" || candidate.userInfo.avatar === null ? candidate.userInfo.avatar : null,
      bio: typeof candidate.userInfo.bio === "string" || candidate.userInfo.bio === null ? candidate.userInfo.bio : null,
      selfIntroduction:
        typeof candidate.userInfo.selfIntroduction === "string" || candidate.userInfo.selfIntroduction === null
          ? candidate.userInfo.selfIntroduction
          : null
    },
    shades: Array.isArray(candidate.shades) ? candidate.shades : [],
    softMemory: Array.isArray(candidate.softMemory) ? candidate.softMemory : []
  };
}

async function recomputeAnimalPersonas() {
  const [{ pool, sql }, { mapSecondMeProfileToPersona }] = await Promise.all([
    import("../lib/db"),
    import("../lib/persona-mapper")
  ]);
  const { rows } = await sql<AnimalProfileRow>(
    `
      SELECT id, user_id, animal_type, mapping_version, raw_secondme_profile
      FROM animal_profiles
      ORDER BY created_at ASC
    `
  );

  let changed = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const row of rows) {
    const normalized = normalizeRawProfile(row.raw_secondme_profile);

    if (!normalized) {
      skipped += 1;
      console.warn(`[recompute-animal-personas] skipped profile ${row.id}: missing raw_secondme_profile payload`);
      continue;
    }

    const mapped = mapSecondMeProfileToPersona(normalized);
    const nextStyles = JSON.stringify({ styles: mapped.persona.recommendedStyles });
    const nextRawProfile = JSON.stringify(mapped.rawSecondMeProfile);
    const nextAnimalType = mapped.persona.animalType;
    const isChanged = row.animal_type !== nextAnimalType || row.mapping_version !== mapped.mappingVersion;

    await sql(
      `
        UPDATE animal_profiles
        SET
          animal_type = $2,
          animal_name = $3,
          display_label = $4,
          summary = $5,
          tendencies = $6::jsonb,
          values = $7::jsonb,
          expression_style = $8,
          dimension_scores = $9::jsonb,
          story_preferences = $10::jsonb,
          mapping_version = $11,
          mapping_reason = $12,
          confidence_score = $13,
          raw_secondme_profile = $14::jsonb,
          updated_at = NOW()
        WHERE id = $1
      `,
      [
        row.id,
        mapped.persona.animalType,
        mapped.persona.animalName,
        mapped.persona.displayLabel,
        mapped.persona.summary,
        toJson(mapped.persona.tendencies),
        toJson(mapped.persona.values),
        mapped.persona.expressionStyle,
        toJson(mapped.persona.dimensionScores),
        nextStyles,
        mapped.mappingVersion,
        mapped.mappingReason,
        mapped.confidenceScore,
        nextRawProfile
      ]
    );

    if (isChanged) {
      changed += 1;
    } else {
      unchanged += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        total: rows.length,
        changed,
        unchanged,
        skipped
      },
      null,
      2
    )
  );
}

recomputeAnimalPersonas()
  .catch((error) => {
    console.error("[recompute-animal-personas] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { pool } = await import("../lib/db");
    const poolWithEnd = pool as unknown as { end?: () => Promise<void> };
    await poolWithEnd.end?.();
  });
