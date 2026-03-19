const DEFAULT_OSS_BUCKET = "agentravel";
const DEFAULT_OSS_REGION = "oss-cn-hongkong";
const STORY_COVER_CDN_PREFIX = "/story";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function ensureLeadingSlash(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function getDerivedOssBaseUrl() {
  const bucket = process.env.ALIYUN_OSS_BUCKET?.trim() || DEFAULT_OSS_BUCKET;
  const region = process.env.ALIYUN_OSS_REGION?.trim() || DEFAULT_OSS_REGION;

  return `https://${bucket}.${region}.aliyuncs.com`;
}

export function getStoryCoverCdnBaseUrl() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_ASSET_PREFIX?.trim() ||
    process.env.NEXT_PUBLIC_STORY_COVER_CDN_BASE_URL?.trim() ||
    process.env.STORY_COVER_CDN_BASE_URL?.trim() ||
    process.env.ALIYUN_CDN_BASE_URL?.trim();

  return trimTrailingSlash(configuredBaseUrl || getDerivedOssBaseUrl());
}

export function getStoryCoverCdnUrl(pathname: string) {
  if (/^https?:\/\//i.test(pathname)) {
    return pathname;
  }

  return `${getStoryCoverCdnBaseUrl()}${STORY_COVER_CDN_PREFIX}${ensureLeadingSlash(pathname)}`;
}

export function getStoryCoverFallbackSrc(slug: string) {
  return getStoryCoverCdnUrl(`/covers/${slug}`);
}

export function getManagedStoryCoverPath(src: string) {
  if (src.startsWith("/")) {
    return src;
  }

  const prefix = `${getStoryCoverCdnBaseUrl()}${STORY_COVER_CDN_PREFIX}`;

  if (!src.startsWith(prefix)) {
    return null;
  }

  const managedPath = src.slice(prefix.length);

  return managedPath.startsWith("/") ? managedPath : `/${managedPath}`;
}

export function isManagedStoryCoverAsset(src: string) {
  return getManagedStoryCoverPath(src) !== null;
}

export function isStoryCoverFallbackSrc(src: string, slug: string) {
  return getManagedStoryCoverPath(src) === `/covers/${slug}`;
}
