import React from "react";
import { SecondaryPageLoadingShell } from "@/components/secondary-page-loading-shell";

export default function Loading() {
  return <SecondaryPageLoadingShell activeTab="memory" title="冒险故事" layout="story-detail" />;
}
