import React from "react";
import type { AdventureParticipantPreview } from "@/lib/story-experience";

type ParticipantAvatarProps = {
  displayName: string;
  avatar: string | null;
  role?: "owner" | "participant";
  size?: "xs" | "sm" | "md";
  testId?: string;
};

type ParticipantAvatarStackProps = {
  participants: AdventureParticipantPreview[];
  maxVisible?: number;
  size?: "xs" | "sm" | "md";
  testId?: string;
};

function getAvatarFallbackLabel(displayName: string) {
  const compactName = Array.from(displayName.trim().replace(/\s+/g, ""));

  if (compactName.length === 0) {
    return "同伴";
  }

  return compactName.slice(0, 2).join("");
}

function sortParticipants(participants: AdventureParticipantPreview[]) {
  return [...participants].sort((a, b) => {
    const roleDiff = (a.role === "owner" ? 0 : 1) - (b.role === "owner" ? 0 : 1);

    if (roleDiff !== 0) {
      return roleDiff;
    }

    return a.joinedAt.localeCompare(b.joinedAt);
  });
}

export function ParticipantAvatar({
  displayName,
  avatar,
  role = "participant",
  size = "sm",
  testId
}: ParticipantAvatarProps) {
  const isOwner = role === "owner";
  const sizeClass = size === "md" ? "h-11 w-11 text-sm" : size === "sm" ? "h-9 w-9 text-xs" : "h-7 w-7 text-[11px]";
  const toneClass = isOwner
    ? "bg-[rgba(255,238,221,0.92)] text-[var(--apricot)]"
    : "bg-[var(--sky-light)] text-[var(--sky)]";
  const ownerDotSizeClass = size === "md" ? "h-3 w-3" : size === "sm" ? "h-3 w-3" : "h-2.5 w-2.5";

  return (
    <div
      className={`relative inline-flex ${sizeClass} items-center justify-center overflow-hidden rounded-full ring-2 ring-[rgba(252,251,250,0.96)] shadow-[var(--shadow-small)] ${toneClass}`}
      title={displayName}
      aria-label={displayName}
      data-testid={testId ?? "participant-avatar"}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={`${displayName} 头像`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="px-1 text-center font-semibold leading-none">{getAvatarFallbackLabel(displayName)}</span>
      )}
      {isOwner ? (
        <span
          className={`absolute bottom-0 right-0 ${ownerDotSizeClass} rounded-full border border-[rgba(252,251,250,0.96)] bg-[var(--accent-moss)]`}
        />
      ) : null}
    </div>
  );
}

export function ParticipantAvatarStack({
  participants,
  maxVisible = 5,
  size = "sm",
  testId = "participant-avatar-stack"
}: ParticipantAvatarStackProps) {
  const sortedParticipants = sortParticipants(participants);
  const visibleParticipants = sortedParticipants.slice(0, maxVisible);
  const overflowCount = Math.max(0, sortedParticipants.length - visibleParticipants.length);
  const overlapClass = size === "md" ? "-ml-3" : size === "sm" ? "-ml-2" : "-ml-1.5";
  const overflowSizeClass =
    size === "md" ? "h-11 w-11 text-sm" : size === "sm" ? "h-9 w-9 text-xs" : "h-7 w-7 text-[11px]";

  return (
    <div className="flex items-center" data-testid={testId}>
      {visibleParticipants.map((participant, index) => (
        <div key={participant.userId} className={index === 0 ? "" : overlapClass}>
          <ParticipantAvatar
            displayName={participant.displayName}
            avatar={participant.avatar}
            role={participant.role}
            size={size}
          />
        </div>
      ))}

      {overflowCount > 0 ? (
        <div
          className={`${visibleParticipants.length > 0 ? overlapClass : ""} inline-flex ${overflowSizeClass} items-center justify-center rounded-full border border-[rgba(252,251,250,0.96)] bg-[rgba(255,255,255,0.9)] font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-small)]`}
          data-testid="participant-avatar-overflow"
        >
          +{overflowCount}
        </div>
      ) : null}
    </div>
  );
}
