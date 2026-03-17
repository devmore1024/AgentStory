import { getAuthSession, isAuthSessionExpired } from "@/lib/auth";
import { upsertAuthenticatedViewer } from "@/lib/current-user";
import { isMissingRelationError, sql } from "@/lib/db";
import { mapSecondMeProfileToPersona } from "@/lib/persona-mapper";
import {
  fetchSecondMeShades,
  fetchSecondMeSoftMemory,
  fetchSecondMeUserInfo,
  type SecondMeShade,
  type SecondMeSoftMemory,
  type SecondMeUserInfo
} from "@/lib/secondme";
import { hasFreshSecondMeCache } from "@/lib/story-experience-helpers";

type CacheStatus = "fresh" | "stale";

type CacheRow = {
  secondme_user_id: string;
  user_info: unknown;
  shades: unknown;
  soft_memory: unknown;
  fetched_at: string;
  expires_at: string | null;
  status: CacheStatus;
};

export type SecondMeStoryContext = {
  secondMeUserId: string;
  userInfo: SecondMeUserInfo;
  shades: SecondMeShade[];
  softMemory: SecondMeSoftMemory[];
  fetchedAt: string;
  expiresAt: string | null;
  source: "live" | "cache" | "stale";
};

export class StoryExperienceMigrationError extends Error {
  constructor() {
    super("Story experience migration is not applied.");
    this.name = "StoryExperienceMigrationError";
  }
}

function toJson(value: unknown) {
  return JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeSecondMeUserInfo(value: unknown, secondMeUserId: string): SecondMeUserInfo | null {
  if (!isRecord(value)) {
    return null;
  }

  const userId = normalizeString(value.userId) ?? secondMeUserId;
  const name = normalizeString(value.name);

  if (!name) {
    return null;
  }

  return {
    userId,
    name,
    avatar: normalizeString(value.avatar),
    bio: normalizeString(value.bio),
    selfIntroduction: normalizeString(value.selfIntroduction),
    email: normalizeString(value.email),
    route: normalizeString(value.route)
  };
}

function normalizeSecondMeShade(value: unknown): SecondMeShade | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    shadeName: normalizeString(value.shadeName) ?? undefined,
    shadeDescription: normalizeString(value.shadeDescription) ?? undefined,
    shadeContent: normalizeString(value.shadeContent) ?? undefined,
    sourceTopics: normalizeStringArray(value.sourceTopics),
    confidenceLevel: normalizeString(value.confidenceLevel) ?? undefined
  };
}

function normalizeSecondMeSoftMemory(value: unknown): SecondMeSoftMemory | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    factObject: normalizeString(value.factObject) ?? undefined,
    factContent: normalizeString(value.factContent) ?? undefined
  };
}

function parseCacheRow(row: CacheRow): SecondMeStoryContext | null {
  const userInfo = normalizeSecondMeUserInfo(row.user_info, row.secondme_user_id);

  if (!userInfo) {
    return null;
  }

  const shades = Array.isArray(row.shades)
    ? row.shades.map((item) => normalizeSecondMeShade(item)).filter((item): item is SecondMeShade => Boolean(item))
    : [];
  const softMemory = Array.isArray(row.soft_memory)
    ? row.soft_memory
        .map((item) => normalizeSecondMeSoftMemory(item))
        .filter((item): item is SecondMeSoftMemory => Boolean(item))
    : [];

  return {
    secondMeUserId: row.secondme_user_id,
    userInfo,
    shades,
    softMemory,
    fetchedAt: row.fetched_at,
    expiresAt: row.expires_at,
    source: row.status === "stale" ? "stale" : "cache"
  };
}

async function getContextCacheRow(secondMeUserId: string) {
  try {
    const { rows } = await sql<CacheRow>(
      `
        SELECT
          secondme_user_id,
          user_info,
          shades,
          soft_memory,
          fetched_at,
          expires_at,
          status
        FROM secondme_context_cache
        WHERE secondme_user_id = $1
        LIMIT 1
      `,
      [secondMeUserId]
    );

    return rows[0] ?? null;
  } catch (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw error;
  }
}

async function touchContextCache(secondMeUserId: string) {
  try {
    await sql(
      `
        UPDATE secondme_context_cache
        SET last_used_at = NOW(),
            updated_at = NOW()
        WHERE secondme_user_id = $1
      `,
      [secondMeUserId]
    );
  } catch (error) {
    if (!isMissingRelationError(error)) {
      throw error;
    }
  }
}

async function markContextCacheStale(secondMeUserId: string) {
  try {
    await sql(
      `
        UPDATE secondme_context_cache
        SET status = 'stale',
            last_used_at = NOW(),
            updated_at = NOW()
        WHERE secondme_user_id = $1
      `,
      [secondMeUserId]
    );
  } catch (error) {
    if (!isMissingRelationError(error)) {
      throw error;
    }
  }
}

export async function upsertSecondMeContextCache(params: {
  secondMeUserId: string;
  userInfo: SecondMeUserInfo;
  shades: SecondMeShade[];
  softMemory: SecondMeSoftMemory[];
}) {
  try {
    const { rows } = await sql<{ fetched_at: string; expires_at: string }>(
      `
        INSERT INTO secondme_context_cache (
          secondme_user_id,
          user_info,
          shades,
          soft_memory,
          fetched_at,
          expires_at,
          last_used_at,
          status
        )
        VALUES (
          $1,
          $2::jsonb,
          $3::jsonb,
          $4::jsonb,
          NOW(),
          NOW() + interval '24 hours',
          NOW(),
          'fresh'
        )
        ON CONFLICT (secondme_user_id) DO UPDATE
        SET
          user_info = EXCLUDED.user_info,
          shades = EXCLUDED.shades,
          soft_memory = EXCLUDED.soft_memory,
          fetched_at = NOW(),
          expires_at = NOW() + interval '24 hours',
          last_used_at = NOW(),
          status = 'fresh',
          updated_at = NOW()
        RETURNING fetched_at, expires_at
      `,
      [params.secondMeUserId, toJson(params.userInfo), toJson(params.shades), toJson(params.softMemory)]
    );

    return rows[0];
  } catch (error) {
    if (isMissingRelationError(error)) {
      throw new StoryExperienceMigrationError();
    }

    throw error;
  }
}

export async function syncAuthenticatedViewerFromSecondMeData(params: {
  userInfo: SecondMeUserInfo;
  shades: SecondMeShade[];
  softMemory: SecondMeSoftMemory[];
  skipCacheWrite?: boolean;
}) {
  const mapped = mapSecondMeProfileToPersona({
    userInfo: params.userInfo,
    shades: params.shades,
    softMemory: params.softMemory
  });

  if (!params.skipCacheWrite) {
    try {
      await upsertSecondMeContextCache({
        secondMeUserId: params.userInfo.userId,
        userInfo: params.userInfo,
        shades: params.shades,
        softMemory: params.softMemory
      });
    } catch (error) {
      if (!(error instanceof StoryExperienceMigrationError)) {
        throw error;
      }
    }
  }

  await upsertAuthenticatedViewer({
    secondMeUserId: params.userInfo.userId,
    displayName: params.userInfo.name,
    avatar: params.userInfo.avatar ?? null,
    persona: mapped.persona,
    mappingVersion: mapped.mappingVersion,
    mappingReason: mapped.mappingReason,
    confidenceScore: mapped.confidenceScore,
    rawSecondMeProfile: mapped.rawSecondMeProfile
  });

  return mapped;
}

async function fetchLiveSecondMeStoryContext(accessToken: string) {
  const [userInfo, shades, softMemory] = await Promise.all([
    fetchSecondMeUserInfo(accessToken),
    fetchSecondMeShades(accessToken),
    fetchSecondMeSoftMemory(accessToken)
  ]);

  const cacheMeta = await upsertSecondMeContextCache({
    secondMeUserId: userInfo.userId,
    userInfo,
    shades,
    softMemory
  });

  await syncAuthenticatedViewerFromSecondMeData({
    userInfo,
    shades,
    softMemory,
    skipCacheWrite: true
  });

  return {
    secondMeUserId: userInfo.userId,
    userInfo,
    shades,
    softMemory,
    fetchedAt: cacheMeta.fetched_at,
    expiresAt: cacheMeta.expires_at,
    source: "live" as const
  };
}

export async function getCachedSecondMeStoryContext() {
  const session = await getAuthSession();

  if (!session || isAuthSessionExpired(session)) {
    return null;
  }

  const cachedRow = await getContextCacheRow(session.secondMeUserId);
  const cachedContext = cachedRow ? parseCacheRow(cachedRow) : null;

  if (cachedContext && hasFreshSecondMeCache(cachedContext.expiresAt)) {
    await touchContextCache(session.secondMeUserId);
    return {
      ...cachedContext,
      source: "cache" as const
    };
  }

  try {
    return await fetchLiveSecondMeStoryContext(session.accessToken);
  } catch (error) {
    if (cachedContext) {
      await markContextCacheStale(session.secondMeUserId);
      return {
        ...cachedContext,
        source: "stale" as const
      };
    }

    throw error;
  }
}
