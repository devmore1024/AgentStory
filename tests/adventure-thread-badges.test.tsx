import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdventureThreadBadges } from "@/components/adventure-thread-badges";

describe("AdventureThreadBadges", () => {
  it("shows the initiator tag only for threads started by the current user", () => {
    const { rerender } = render(
      <AdventureThreadBadges
        isOwner
        isCompleted={false}
        generationState="idle"
        participantCount={2}
        participantLimit={4}
        episodeCount={1}
        episodeLimit={6}
      />
    );

    expect(screen.getByText("我发起的")).toBeInTheDocument();
    expect(screen.getByText("进行中")).toBeInTheDocument();
    expect(screen.getByText("2/4 人")).toBeInTheDocument();
    expect(screen.getByText("一/六 章")).toBeInTheDocument();

    rerender(
      <AdventureThreadBadges
        isOwner={false}
        isCompleted={false}
        generationState="idle"
        participantCount={2}
        participantLimit={4}
        episodeCount={1}
        episodeLimit={6}
      />
    );

    expect(screen.queryByText("我发起的")).not.toBeInTheDocument();
  });
});
