import React from "react";
import { AppShell } from "@/components/app-shell";
import { PageBackButton } from "@/components/page-back-button";
import { PersonaSvgGallery } from "@/components/persona-svg-gallery";

export default function PersonaSvgGalleryPage() {
  return (
    <AppShell activeTab="me">
      <div className="grid gap-6">
        <PageBackButton fallbackHref="/me" title="人格图谱" />
        <PersonaSvgGallery />
      </div>
    </AppShell>
  );
}
