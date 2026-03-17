"use client";

import { useEffect, useState } from "react";

type CoverArtImageProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
  className: string;
  objectPosition: string;
  isExternal: boolean;
};

export function CoverArtImage({
  src,
  fallbackSrc,
  alt,
  className,
  objectPosition,
  isExternal
}: CoverArtImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasSwitchedToFallback, setHasSwitchedToFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasSwitchedToFallback(false);
  }, [fallbackSrc, src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      data-cover-source={isExternal ? "external" : "local"}
      className={className}
      style={{ objectPosition }}
      onError={() => {
        if (!hasSwitchedToFallback && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          setHasSwitchedToFallback(true);
        }
      }}
    />
  );
}
