import React from "react";
import { PageBackButton } from "@/components/page-back-button";
import { PersonaSvgGallery } from "@/components/persona-svg-gallery";

export default function PersonaSvgGalleryPage() {
  return (
    <>
      <div className="grid gap-6">
        <PageBackButton fallbackHref="/me" title="人格图谱" />
        <PersonaSvgGallery />
      </div>
    </>
  );
}
