import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ParticipantAvatarStack } from "@/components/participant-avatar-stack";

afterEach(() => {
  cleanup();
});

function createParticipant(overrides: Record<string, unknown> = {}) {
  return {
    userId: "user-1",
    displayName: "迪西",
    avatar: null,
    role: "participant" as const,
    joinedAt: "2026-03-19T10:00:00.000Z",
    ...overrides
  };
}

describe("ParticipantAvatarStack", () => {
  it("sorts owner first and renders display-name fallbacks when avatars are missing", () => {
    render(
      <ParticipantAvatarStack
        participants={[
          createParticipant({ userId: "user-2", displayName: "安宁", joinedAt: "2026-03-19T11:00:00.000Z" }),
          createParticipant({
            userId: "user-1",
            displayName: "迪西",
            role: "owner",
            joinedAt: "2026-03-19T09:00:00.000Z"
          })
        ]}
      />
    );

    const stack = screen.getByTestId("participant-avatar-stack");
    const avatars = within(stack).getAllByTestId("participant-avatar");

    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveAttribute("aria-label", "迪西");
    expect(avatars[1]).toHaveAttribute("aria-label", "安宁");
    expect(screen.getByText("迪西")).toBeInTheDocument();
    expect(screen.getByText("安宁")).toBeInTheDocument();
  });

  it("shows at most five avatars and renders overflow as +N", () => {
    render(
      <ParticipantAvatarStack
        participants={[
          createParticipant({ userId: "owner", displayName: "发起人", role: "owner", joinedAt: "2026-03-19T08:00:00.000Z" }),
          createParticipant({ userId: "p-1", displayName: "一号", joinedAt: "2026-03-19T09:00:00.000Z" }),
          createParticipant({ userId: "p-2", displayName: "二号", joinedAt: "2026-03-19T10:00:00.000Z" }),
          createParticipant({ userId: "p-3", displayName: "三号", joinedAt: "2026-03-19T11:00:00.000Z" }),
          createParticipant({ userId: "p-4", displayName: "四号", joinedAt: "2026-03-19T12:00:00.000Z" }),
          createParticipant({ userId: "p-5", displayName: "五号", joinedAt: "2026-03-19T13:00:00.000Z" }),
          createParticipant({ userId: "p-6", displayName: "六号", joinedAt: "2026-03-19T14:00:00.000Z" })
        ]}
      />
    );

    const stack = screen.getByTestId("participant-avatar-stack");

    expect(within(stack).getAllByTestId("participant-avatar")).toHaveLength(5);
    expect(within(stack).getByTestId("participant-avatar-overflow")).toHaveTextContent("+2");
  });

  it("supports a compact xs size for dense list badges", () => {
    render(
      <ParticipantAvatarStack
        participants={[createParticipant({ role: "owner" })]}
        size="xs"
      />
    );

    expect(within(screen.getByTestId("participant-avatar-stack")).getByTestId("participant-avatar")).toHaveClass("h-7", "w-7");
  });
});
