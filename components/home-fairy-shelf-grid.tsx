import React from "react";
import type { ReactNode } from "react";

type HomeFairyShelfGridProps = {
  children: ReactNode;
};

export function HomeFairyShelfGrid({ children }: HomeFairyShelfGridProps) {
  return (
    <div data-testid="home-fairy-shelf-grid" className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {children}
    </div>
  );
}
