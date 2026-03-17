export type AdventureActionState = "continue" | "join" | "watch";

type AdventureActionParams = {
  isOwner: boolean;
  isParticipant: boolean;
  isCompleted: boolean;
  isFull: boolean;
};

export function getAdventureActionState(params: AdventureActionParams): AdventureActionState {
  if (params.isCompleted) {
    return "watch";
  }

  if (params.isOwner || params.isParticipant) {
    return "continue";
  }

  return params.isFull ? "watch" : "join";
}

export function hasFreshSecondMeCache(expiresAt: string | null, now = new Date()) {
  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtTime)) {
    return false;
  }

  return expiresAtTime > now.getTime();
}

export function getCurrentAppDate(timeZone = "Asia/Shanghai", now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to format app date.");
  }

  return `${year}-${month}-${day}`;
}
