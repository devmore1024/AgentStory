import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdventureThreadBadges } from "@/components/adventure-thread-badges";

describe("AdventureThreadBadges", () => {
  const participants = [
    {
      userId: "user-1",
      displayName: "迪西",
      avatar: null,
      role: "owner" as const,
      joinedAt: "2026-03-19T09:00:00.000Z"
    },
    {
      userId: "user-2",
      displayName: "安宁",
      avatar: null,
      role: "participant" as const,
      joinedAt: "2026-03-19T10:00:00.000Z"
    }
  ];

  it("shows the initiator tag only for threads started by the current user", () => {
    const { rerender } = render(
      <AdventureThreadBadges
        isOwner
        isCompleted={false}
        generationState="idle"
        participants={participants}
        participantCount={2}
        participantLimit={4}
        episodeCount={1}
        episodeLimit={6}
        lockedStyleName="童话风"
      />
    );

    expect(screen.getByText("我发起的")).toBeInTheDocument();
    expect(screen.getByText("进行中")).toBeInTheDocument();
    expect(screen.getByText("童话风")).toBeInTheDocument();
    expect(screen.getByText("共 一 章")).toBeInTheDocument();

    rerender(
      <AdventureThreadBadges
        isOwner={false}
        isCompleted={false}
        generationState="idle"
        participants={participants}
        participantCount={2}
        participantLimit={4}
        episodeCount={1}
        episodeLimit={6}
        lockedStyleName="童话风"
      />
    );

    expect(screen.queryByText("我发起的")).not.toBeInTheDocument();
  });

  it("renders a compact list variant with the participant badge first", () => {
    cleanup();

    render(
      <AdventureThreadBadges
        isOwner
        isCompleted={false}
        generationState="idle"
        participants={participants}
        participantCount={2}
        participantLimit={4}
        episodeCount={1}
        episodeLimit={6}
        lockedStyleName="童话风"
        variant="listCompact"
      />
    );

    const badges = screen.getByTestId("adventure-thread-badges");
    const badgeChildren = Array.from(badges.children);

    expect(badgeChildren[0]).toHaveAttribute("data-testid", "adventure-badge-participants");
    expect(badgeChildren[3]).toHaveAttribute("data-testid", "adventure-badge-style");
    expect(screen.getByText("2/4")).toBeInTheDocument();
    expect(screen.getByText("位同行者")).toHaveClass("hidden", "sm:inline");
    expect(within(screen.getByTestId("adventure-badge-avatar-stack")).getAllByTestId("participant-avatar")).toHaveLength(2);
    expect(within(screen.getByTestId("adventure-badge-avatar-stack")).getAllByTestId("participant-avatar")[0]).toHaveClass("h-7", "w-7");
  });
});
