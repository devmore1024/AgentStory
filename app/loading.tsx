import { AppShell } from "@/components/app-shell";

export default function Loading() {
  return (
    <AppShell activeTab="home">
      <div className="grid gap-6">
        <div className="h-64 animate-pulse rounded-[32px] bg-[var(--background-card)] bg-opacity-75 shadow-[var(--shadow-medium)]" />
        <div className="h-72 animate-pulse rounded-[32px] bg-[var(--background-card)] bg-opacity-60 shadow-[var(--shadow-medium)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-[24px] bg-[var(--background-card)] bg-opacity-75 shadow-[var(--shadow-small)]"
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
