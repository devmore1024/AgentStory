import type { AdventureThreadView, PersonalLineBookView } from "@/lib/story-experience";

type StoryFootprintItemView = {
  id: string;
  title: string;
  href: string;
};

export function getJoinedFootprintThreads(threads: AdventureThreadView[]) {
  return threads.filter((thread) => !thread.isOwner && thread.isParticipant);
}

export function getStoryFootprintView(params: {
  personalLineBooks: PersonalLineBookView[];
  adventureThreads: AdventureThreadView[];
}) {
  const joinedThreads = getJoinedFootprintThreads(params.adventureThreads);

  return {
    ownedCount: params.personalLineBooks.length,
    joinedCount: joinedThreads.length,
    ownedItems: params.personalLineBooks.slice(0, 3).map<StoryFootprintItemView>((line) => ({
      id: line.threadId,
      title: line.title,
      href: `/memory/${line.sourceBookSlug}`
    })),
    joinedItems: joinedThreads.slice(0, 3).map<StoryFootprintItemView>((thread) => ({
      id: thread.id,
      title: thread.title,
      href: `/adventure/${thread.id}`
    }))
  };
}
