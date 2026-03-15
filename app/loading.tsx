import { AppShell } from "@/components/app-shell";

export default function Loading() {
  return (
    <AppShell activeTab="home">
      <div className="grid gap-6">
        <div className="h-64 animate-pulse rounded-[32px] bg-[rgba(255,250,243,0.75)] shadow-[var(--shadow-medium)]" />
        <div className="h-72 animate-pulse rounded-[32px] bg-[rgba(236,215,189,0.62)] shadow-[var(--shadow-medium)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-[24px] bg-[rgba(255,250,243,0.78)] shadow-[var(--shadow-small)]"
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
