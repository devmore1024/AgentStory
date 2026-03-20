import React from "react";
import { animalPersonas, type AnimalType } from "@/lib/animal-personas";

type PersonaBadgeProps = {
  animalType: AnimalType;
  size?: "sm" | "md" | "lg";
  variant?: "soft" | "paper";
};

const sizeMap = {
  sm: "h-14 w-14 rounded-[18px]",
  md: "h-20 w-20 rounded-[24px]",
  lg: "h-24 w-24 rounded-[28px]"
} as const;

const softFillProps = {
  fill: "currentColor",
  stroke: "none",
  opacity: 0.16,
  "data-fill": "soft"
} as const;

const accentFillProps = {
  fill: "currentColor",
  stroke: "none",
  opacity: 0.42,
  "data-fill": "soft"
} as const;

export const badgeFeatureIds: Record<AnimalType, readonly string[]> = {
  bear: ["bear-ears", "bear-forehead", "bear-cheeks", "bear-muzzle", "bear-nose"],
  deer: ["deer-antlers", "deer-ears", "deer-brow", "deer-muzzle", "deer-jaw"],
  fox: ["fox-ears", "fox-face", "fox-muzzle", "fox-cheek-fur", "fox-tail"],
  owl: ["owl-ear-tufts", "owl-eye-discs", "owl-eye-centers", "owl-beak", "owl-chest"],
  wolf: ["wolf-ears", "wolf-brow", "wolf-muzzle", "wolf-jaw", "wolf-neck-fur"],
  cat: ["cat-ears", "cat-brow", "cat-whiskers", "cat-nose", "cat-mouth"],
  rabbit: ["rabbit-ears", "rabbit-ear-cores", "rabbit-face", "rabbit-muzzle", "rabbit-mouth"],
  raven: ["raven-beak", "raven-head", "raven-neck", "raven-wing", "raven-tail"],
  lion: ["lion-mane-outer", "lion-mane-inner", "lion-ears", "lion-muzzle", "lion-whisker-pads"],
  dog: ["dog-ears", "dog-brow", "dog-cheeks", "dog-muzzle", "dog-nose"],
  dolphin: ["dolphin-arc", "dolphin-snout", "dolphin-dorsal-fin", "dolphin-belly", "dolphin-tail-stock"],
  swan: ["swan-neck", "swan-head", "swan-beak", "swan-wing", "swan-tail"],
  otter: ["otter-ears", "otter-head", "otter-whiskers", "otter-belly", "otter-tail"],
  squirrel: ["squirrel-tail", "squirrel-ears", "squirrel-face", "squirrel-chest", "squirrel-paws"],
  horse: ["horse-ears", "horse-forehead", "horse-mane", "horse-muzzle", "horse-jaw"],
  hedgehog: ["hedgehog-spines", "hedgehog-brow", "hedgehog-body", "hedgehog-nose", "hedgehog-belly"],
  elephant: ["elephant-ears", "elephant-ear-centers", "elephant-forehead", "elephant-trunk", "elephant-tusk"],
  crane: ["crane-neck", "crane-beak", "crane-body", "crane-wing", "crane-legs"],
  whale: ["whale-head", "whale-body", "whale-belly", "whale-fin", "whale-tail"],
  falcon: ["falcon-beak", "falcon-brow", "falcon-head", "falcon-wing", "falcon-chest"]
};

function iconStroke(animalType: AnimalType) {
  switch (animalType) {
    case "bear":
      return (
        <>
          <g data-feature="bear-ears">
            <circle cx="42" cy="35" r="9" />
            <circle cx="86" cy="35" r="9" />
            <circle {...softFillProps} cx="42" cy="35" r="4" />
            <circle {...softFillProps} cx="86" cy="35" r="4" />
          </g>
          <g data-feature="bear-forehead">
            <path d="M46 50c4-10 10-15 18-15s14 5 18 15" />
            <path {...softFillProps} d="M46 50c6-8 12-11 18-11s12 3 18 11v10H46V50z" />
          </g>
          <path data-feature="bear-cheeks" d="M34 57c0-17 13-29 30-29s30 12 30 29v14c0 17-13 29-30 29S34 88 34 71V57z" />
          <g data-feature="bear-muzzle">
            <ellipse cx="64" cy="74" rx="18" ry="13" />
            <ellipse {...softFillProps} cx="64" cy="74" rx="15" ry="10" />
          </g>
          <g data-feature="bear-nose">
            <path {...accentFillProps} d="M64 67l-5 5h10l-5-5z" />
            <path d="M56 82c4 4 12 4 16 0" strokeWidth="4.5" />
          </g>
        </>
      );
    case "deer":
      return (
        <>
          <g data-feature="deer-antlers">
            <path d="M51 42l-8-21m8 21l-12-7m10 1l-8 10" />
            <path d="M77 42l8-21m-8 21l12-7m-10 1l8 10" />
          </g>
          <g data-feature="deer-ears">
            <path d="M48 50l-8-10 12 2" />
            <path d="M80 50l8-10-12 2" />
          </g>
          <g data-feature="deer-brow">
            <path d="M49 57c3-7 8-11 15-11s12 4 15 11" />
            <path {...softFillProps} d="M49 58c4-6 9-8 15-8s11 2 15 8v8H49v-8z" />
          </g>
          <g data-feature="deer-muzzle">
            <path d="M48 58c2-14 10-24 16-24s14 10 16 24l-3 18c-2 10-6 17-13 17s-11-7-13-17l-3-18z" />
            <path {...softFillProps} d="M56 71c2-5 5-7 8-7s6 2 8 7c-2 5-4 8-8 8s-6-3-8-8z" />
          </g>
          <path data-feature="deer-jaw" d="M52 83c4 4 20 4 24 0" strokeWidth="4.5" />
        </>
      );
    case "fox":
      return (
        <>
          <g data-feature="fox-ears">
            <path d="M40 55l14-25 9 16" />
            <path d="M88 55L74 30l-9 16" />
            <path {...softFillProps} d="M46 51l8-13 5 8" />
            <path {...softFillProps} d="M82 51l-8-13-5 8" />
          </g>
          <path data-feature="fox-face" d="M44 57c0-15 9-25 20-25s20 10 20 25v16c0 12-9 20-20 20s-20-8-20-20V57z" />
          <g data-feature="fox-muzzle">
            <path d="M54 67c3-5 6-7 10-7s7 2 10 7c-3 9-6 12-10 12s-7-3-10-12z" />
            <path {...accentFillProps} d="M64 64l-4 4h8l-4-4z" />
          </g>
          <g data-feature="fox-cheek-fur">
            <path d="M44 67l-8 8 12-1m28 0l8 8-12-1" strokeWidth="4.5" />
            <path {...softFillProps} d="M44 68c5 3 12 5 20 5s15-2 20-5v10c-4 8-11 13-20 13s-16-5-20-13V68z" />
          </g>
          <g data-feature="fox-tail">
            <path d="M85 81c10 0 17-6 20-14-3-10-10-15-18-16" />
            <path {...softFillProps} d="M88 80c8-1 12-5 14-11-2-6-6-9-12-10" />
          </g>
        </>
      );
    case "owl":
      return (
        <>
          <g data-feature="owl-ear-tufts">
            <path d="M48 37l7-10 4 12" />
            <path d="M80 37l-7-10-4 12" />
          </g>
          <g data-feature="owl-eye-discs">
            <circle cx="54" cy="58" r="10" />
            <circle cx="74" cy="58" r="10" />
          </g>
          <g data-feature="owl-eye-centers">
            <circle {...accentFillProps} cx="54" cy="58" r="3.5" />
            <circle {...accentFillProps} cx="74" cy="58" r="3.5" />
          </g>
          <path d="M42 58c0-16 9-27 22-27s22 11 22 27v18c0 10-8 18-18 18H60c-10 0-18-8-18-18V58z" />
          <path data-feature="owl-beak" d="M64 60l-5 8h10l-5-8z" />
          <g data-feature="owl-chest">
            <path d="M53 79c3 3 7 4 11 4s8-1 11-4" strokeWidth="4.5" />
            <path {...softFillProps} d="M49 72c5 5 10 7 15 7s10-2 15-7v11c-4 5-9 8-15 8s-11-3-15-8V72z" />
          </g>
        </>
      );
    case "wolf":
      return (
        <>
          <g data-feature="wolf-ears">
            <path d="M43 51l11-23 8 15" />
            <path d="M85 49L74 27l-8 16" />
          </g>
          <g data-feature="wolf-brow">
            <path d="M49 57c5-8 10-12 17-12s12 4 17 11" />
            <path {...softFillProps} d="M48 58c6-5 12-8 18-8s11 3 17 8l-3 8H51l-3-8z" />
          </g>
          <g data-feature="wolf-muzzle">
            <path d="M57 67c5-5 10-7 15-7s9 2 12 6c-4 7-10 11-18 12" />
            <path {...accentFillProps} d="M77 64l5 3-6 5" />
          </g>
          <path d="M45 56c0-15 9-24 20-24s20 9 20 24v14c0 12-9 20-20 20s-20-8-20-20V56z" />
          <path data-feature="wolf-jaw" d="M54 79c4 4 18 4 24 0" strokeWidth="4.5" />
          <g data-feature="wolf-neck-fur">
            <path d="M50 83l-10 9m24-9l-6 11m20-11l9 9" strokeWidth="4.5" />
            <path {...softFillProps} d="M49 81c5 5 10 7 16 7s11-2 16-7v8c-4 4-9 7-16 7s-12-3-16-7v-8z" />
          </g>
        </>
      );
    case "cat":
      return (
        <>
          <g data-feature="cat-ears">
            <path d="M45 43l10-15 6 17" />
            <path d="M83 43L73 28l-6 17" />
            <path {...softFillProps} d="M50 41l5-7 3 8" />
            <path {...softFillProps} d="M78 41l-5-7-3 8" />
          </g>
          <path d="M42 58c0-16 10-27 22-27s22 11 22 27v16c0 11-9 19-22 19s-22-8-22-19V58z" />
          <g data-feature="cat-brow">
            <path d="M49 58c3-5 7-8 12-8s9 3 12 8" strokeWidth="4.5" />
            <path {...softFillProps} d="M48 60c5-4 10-6 16-6s11 2 16 6l-2 7H50l-2-7z" />
          </g>
          <g data-feature="cat-whiskers">
            <path d="M50 69H39m11 7H37" strokeWidth="4.5" />
            <path d="M78 69h11m-11 7h13" strokeWidth="4.5" />
          </g>
          <path data-feature="cat-nose" {...accentFillProps} d="M64 63l-4 4h8l-4-4z" />
          <path data-feature="cat-mouth" d="M58 72c2 2 6 2 8 0m-8 0c0 5 2 8 6 8s6-3 6-8" strokeWidth="4.5" />
        </>
      );
    case "rabbit":
      return (
        <>
          <g data-feature="rabbit-ears">
            <path d="M48 44V21c0-8 4-12 10-12s10 4 10 12v18" />
            <path d="M60 44V17c0-8 4-12 10-12s10 4 10 12v27" />
          </g>
          <g data-feature="rabbit-ear-cores">
            <path {...softFillProps} d="M54 43V22c0-5 2-8 4-8s4 3 4 8v20z" />
            <path {...softFillProps} d="M66 43V18c0-5 2-8 4-8s4 3 4 8v25z" />
          </g>
          <path data-feature="rabbit-face" d="M40 66c0-17 11-28 24-28s24 11 24 28v6c0 12-10 21-24 21S40 84 40 72v-6z" />
          <g data-feature="rabbit-muzzle">
            <ellipse cx="64" cy="74" rx="14" ry="10" />
            <ellipse {...softFillProps} cx="64" cy="74" rx="11" ry="8" />
          </g>
          <path data-feature="rabbit-mouth" d="M60 72c2 2 6 2 8 0m-8 0v6m8-6v6m-10 5c3 2 9 2 12 0" strokeWidth="4.5" />
        </>
      );
    case "raven":
      return (
        <>
          <g data-feature="raven-head">
            <path d="M37 77c3-18 15-31 31-36 10-3 20-2 29 3-7 4-11 10-13 17-2 13-10 24-24 31H45c-5 0-8-5-8-15z" />
            <path {...softFillProps} d="M50 79c11-3 18-10 22-21 3-8 7-13 12-16-6-1-12-1-18 1-13 4-23 15-26 31 1 5 4 7 10 5z" />
          </g>
          <g data-feature="raven-beak">
            <path d="M78 48l20 2-16 9" />
            <path {...accentFillProps} d="M79 49l12 1-9 5" />
          </g>
          <path data-feature="raven-neck" d="M48 67c6 1 12-1 18-5" strokeWidth="4.5" />
          <g data-feature="raven-wing">
            <path d="M52 72c8-2 15-6 23-13" strokeWidth="4.5" />
            <path {...softFillProps} d="M51 73c8-1 14-4 20-10l3 7c-5 5-11 8-19 10z" />
          </g>
          <g data-feature="raven-tail">
            <path d="M54 83l-10 11m16-9l-6 13" strokeWidth="4.5" />
            <path {...softFillProps} d="M54 83l-6 10 9-5z" />
          </g>
        </>
      );
    case "lion":
      return (
        <>
          <path
            data-feature="lion-mane-outer"
            d="M64 27c7 0 13 3 18 8 10 1 18 10 18 21 0 6-2 11-6 15-1 15-13 26-30 26S35 86 34 71c-4-4-6-9-6-15 0-11 8-20 18-21 5-5 11-8 18-8z"
          />
          <path
            data-feature="lion-mane-inner"
            {...softFillProps}
            d="M64 36c8 0 15 3 21 9 6 2 10 8 10 15 0 4-2 8-4 11-1 12-11 20-27 20s-26-8-27-20c-3-3-5-7-5-11 0-7 4-13 10-15 6-6 13-9 22-9z"
          />
          <g data-feature="lion-ears">
            <circle cx="50" cy="44" r="5.5" />
            <circle cx="78" cy="44" r="5.5" />
          </g>
          <path d="M46 61c0-12 8-20 18-20s18 8 18 20v13c0 9-8 16-18 16s-18-7-18-16V61z" />
          <g data-feature="lion-whisker-pads">
            <ellipse cx="57" cy="76" rx="7" ry="6" />
            <ellipse cx="71" cy="76" rx="7" ry="6" />
            <ellipse {...softFillProps} cx="57" cy="76" rx="5" ry="4" />
            <ellipse {...softFillProps} cx="71" cy="76" rx="5" ry="4" />
          </g>
          <g data-feature="lion-muzzle">
            <path {...accentFillProps} d="M64 69l-5 5h10l-5-5z" />
            <path d="M56 83c4 3 12 3 16 0" strokeWidth="4.5" />
          </g>
        </>
      );
    case "dog":
      return (
        <>
          <g data-feature="dog-ears">
            <path d="M44 47c-8 4-12 12-10 21 2 8 7 15 17 18" />
            <path d="M84 47c8 4 12 12 10 21-2 8-7 15-17 18" />
            <path {...softFillProps} d="M46 51c-5 4-8 10-7 16 1 5 4 10 10 13" />
            <path {...softFillProps} d="M82 51c5 4 8 10 7 16-1 5-4 10-10 13" />
          </g>
          <g data-feature="dog-brow">
            <path d="M49 59c4-5 9-8 15-8s11 3 15 8" strokeWidth="4.5" />
            <path {...softFillProps} d="M47 60c5-4 11-6 17-6s12 2 17 6l-2 7H49l-2-7z" />
          </g>
          <path data-feature="dog-cheeks" d="M38 59c0-15 11-25 26-25s26 10 26 25v12c0 13-11 23-26 23S38 84 38 71V59z" />
          <g data-feature="dog-muzzle">
            <ellipse cx="64" cy="73" rx="16" ry="12" />
            <ellipse {...softFillProps} cx="64" cy="73" rx="13" ry="9" />
          </g>
          <g data-feature="dog-nose">
            <path {...accentFillProps} d="M64 67l-5 5h10l-5-5z" />
            <path d="M56 82c4 4 12 4 16 0" strokeWidth="4.5" />
          </g>
        </>
      );
    case "dolphin":
      return (
        <>
          <path data-feature="dolphin-arc" d="M27 73c12-17 29-28 48-30 12-2 22 2 29 11-11 0-19 3-24 8-5 5-8 11-15 17-9 8-20 13-34 13-6 0-10-6-4-19z" />
          <g data-feature="dolphin-snout">
            <path d="M89 48l13 6-14 3" />
            <path {...accentFillProps} d="M90 49l8 4-9 2" />
          </g>
          <g data-feature="dolphin-dorsal-fin">
            <path d="M66 47l8-13 4 16" />
            <path {...softFillProps} d="M68 46l5-8 3 10" />
          </g>
          <g data-feature="dolphin-belly">
            <path d="M42 82c8 2 18 1 29-4" strokeWidth="4.5" />
            <path {...softFillProps} d="M40 81c9 2 18 1 28-3l-4 9c-9 3-17 4-26 2z" />
          </g>
          <path data-feature="dolphin-tail-stock" d="M55 78c5-1 10-4 15-9" strokeWidth="4.5" />
        </>
      );
    case "swan":
      return (
        <>
          <path data-feature="swan-neck" d="M73 39c8 0 13 7 13 14 0 9-5 15-12 20-7 4-11 9-13 17" />
          <g data-feature="swan-head">
            <path d="M73 39c5 1 8 4 10 8" strokeWidth="4.5" />
            <path {...softFillProps} d="M74 39c3 1 5 3 6 5l-7 3c-1-3-1-6 1-8z" />
          </g>
          <g data-feature="swan-beak">
            <path d="M85 40l12-4-6 8" />
            <path {...accentFillProps} d="M86 40l7-2-4 5" />
          </g>
          <g data-feature="swan-wing">
            <path d="M55 79c8-2 15 0 23 7" strokeWidth="4.5" />
            <path {...softFillProps} d="M50 84c9-8 18-10 28-5-7 7-16 10-28 5z" />
          </g>
          <g data-feature="swan-tail">
            <path d="M81 82l9 5" strokeWidth="4.5" />
            <path {...softFillProps} d="M81 81l7 4-8 1z" />
          </g>
          <path d="M44 85c7-10 17-14 30-14 12 0 21 5 27 14-8 4-19 7-33 7-11 0-18-2-24-7z" />
        </>
      );
    case "otter":
      return (
        <>
          <g data-feature="otter-ears">
            <circle cx="50" cy="45" r="4.5" />
            <circle cx="78" cy="45" r="4.5" />
            <circle {...softFillProps} cx="50" cy="45" r="2.2" />
            <circle {...softFillProps} cx="78" cy="45" r="2.2" />
          </g>
          <path data-feature="otter-head" d="M38 67c0-15 10-25 24-25s24 10 24 25v5c0 12-10 20-24 20S38 84 38 72v-5z" />
          <g data-feature="otter-whiskers">
            <path d="M49 71H38m11 6H35" strokeWidth="4.5" />
            <path d="M75 71h11m-11 6h14" strokeWidth="4.5" />
          </g>
          <g data-feature="otter-belly">
            <ellipse cx="62" cy="77" rx="14" ry="10" />
            <ellipse {...softFillProps} cx="62" cy="77" rx="11" ry="7" />
          </g>
          <g data-feature="otter-tail">
            <path d="M84 80c11 0 18-5 22-12-2-9-8-14-18-16" />
            <path {...softFillProps} d="M88 79c8 0 12-4 15-10-2-5-5-8-11-9" />
          </g>
        </>
      );
    case "squirrel":
      return (
        <>
          <g data-feature="squirrel-tail">
            <path d="M85 34c19 3 24 18 18 31-4 9-13 14-24 15" />
            <path {...softFillProps} d="M82 38c14 3 18 14 14 24-3 7-9 11-18 12" />
          </g>
          <g data-feature="squirrel-ears">
            <path d="M45 49l8-13 6 14" />
            <path d="M73 47l8-13 6 14" />
          </g>
          <path data-feature="squirrel-face" d="M39 69c0-14 9-24 21-24s21 10 21 24v5c0 11-9 18-21 18S39 85 39 74v-5z" />
          <g data-feature="squirrel-chest">
            <path d="M50 79c3 4 7 6 10 6s7-2 10-6" strokeWidth="4.5" />
            <path {...softFillProps} d="M47 77c5 5 9 8 13 8s8-3 13-8l-4 10c-3 3-6 4-9 4s-6-1-9-4z" />
          </g>
          <path data-feature="squirrel-paws" d="M54 71l-3 6m17-6l3 6" strokeWidth="4.5" />
        </>
      );
    case "horse":
      return (
        <>
          <g data-feature="horse-ears">
            <path d="M54 40l6-14 8 10" />
            <path d="M76 46l12-14 4 14" />
          </g>
          <g data-feature="horse-forehead">
            <path d="M55 46c5-6 10-9 16-9" />
            <path {...softFillProps} d="M56 47c5-4 9-6 13-6l3 9c-5 0-10 1-14 4z" />
          </g>
          <g data-feature="horse-mane">
            <path d="M60 39c7 7 12 14 14 24 1 8 0 15-3 23" />
            <path {...softFillProps} d="M61 44c5 7 8 13 9 21 1 6 0 11-2 17" />
          </g>
          <g data-feature="horse-muzzle">
            <path d="M73 71c7 2 14 2 20-1" />
            <path {...accentFillProps} d="M85 69c3 0 5 0 7-1l-3 5c-2 1-4 1-6 0z" />
          </g>
          <path d="M41 88V60l15-21 17 9 15-6 10 17-6 29H70l-8-7-10 7H41z" />
          <path data-feature="horse-jaw" d="M60 82c4-1 8-3 12-7" strokeWidth="4.5" />
        </>
      );
    case "hedgehog":
      return (
        <>
          <g data-feature="hedgehog-spines">
            <path d="M102 70l-8-8 10-4-10-6 10-5-11-5 8-6c-7-5-15-8-24-8-18 0-32 9-40 23" />
            <path {...softFillProps} d="M96 68l-5-6 7-3-7-5 8-4-9-4 6-4c-5-3-10-5-18-5-15 0-27 7-34 18" />
          </g>
          <path data-feature="hedgehog-brow" d="M39 63c3-4 7-6 11-6" strokeWidth="4.5" />
          <path data-feature="hedgehog-body" d="M28 72c0-12 9-21 22-21h22c18 0 30 8 30 21 0 13-12 21-30 21H50c-13 0-22-8-22-21z" />
          <g data-feature="hedgehog-nose">
            <path d="M28 72l-12 2 10 6" />
            <circle {...accentFillProps} cx="20" cy="75" r="2.5" />
          </g>
          <g data-feature="hedgehog-belly">
            <path d="M44 82c8 3 18 3 28 0" strokeWidth="4.5" />
            <path {...softFillProps} d="M42 79c8 4 18 4 30 0l-2 9c-10 3-19 3-26 0z" />
          </g>
        </>
      );
    case "elephant":
      return (
        <>
          <g data-feature="elephant-ears">
            <path d="M38 59c-11 0-20-9-20-21 0-10 7-18 18-18 8 0 14 4 18 11" />
            <path d="M90 59c11 0 20-9 20-21 0-10-7-18-18-18-8 0-14 4-18 11" />
          </g>
          <g data-feature="elephant-ear-centers">
            <path {...softFillProps} d="M34 58c-7-1-12-7-12-16 0-6 4-11 10-12 6 0 10 3 13 8" />
            <path {...softFillProps} d="M94 58c7-1 12-7 12-16 0-6-4-11-10-12-6 0-10 3-13 8" />
          </g>
          <g data-feature="elephant-forehead">
            <path d="M49 52c3-9 8-14 15-14s12 5 15 14" />
            <path {...softFillProps} d="M48 55c5-6 10-9 16-9s11 3 16 9v8H48v-8z" />
          </g>
          <path d="M39 67c0-18 10-30 25-30s25 12 25 30v11c0 12-9 20-20 20H59c-11 0-20-8-20-20V67z" />
          <g data-feature="elephant-trunk">
            <path d="M64 62v18c0 10 5 16 12 16 4 0 8-2 10-5" />
            <path {...softFillProps} d="M65 63v16c0 7 3 12 8 13 3 1 6 0 8-2l2-1c-2 4-6 6-10 6-7 0-12-6-12-16V63z" />
          </g>
          <g data-feature="elephant-tusk">
            <path d="M54 77l-6 8m26-8l6 8" strokeWidth="4.5" />
            <path {...accentFillProps} d="M53 78l-3 5 5-3z" />
            <path {...accentFillProps} d="M75 78l3 5-5-3z" />
          </g>
        </>
      );
    case "crane":
      return (
        <>
          <path data-feature="crane-neck" d="M61 34c8 0 12 7 12 16 0 11-5 19-10 26" />
          <g data-feature="crane-beak">
            <path d="M73 38l24-5-14 11" />
            <path {...accentFillProps} d="M75 38l13-3-8 6" />
          </g>
          <path data-feature="crane-body" d="M51 72c5-8 12-12 20-12 8 0 14 4 18 12-5 10-13 15-28 15-6 0-10-5-10-15z" />
          <g data-feature="crane-wing">
            <path d="M56 74c6-2 12-1 18 4" strokeWidth="4.5" />
            <path {...softFillProps} d="M54 77c7-5 13-6 20-2-4 6-10 8-20 2z" />
          </g>
          <g data-feature="crane-legs">
            <path d="M59 86l-4 14m14-14l8 14" strokeWidth="4.5" />
            <path {...softFillProps} d="M57 86l-2 10 4-3m9-7l5 10-1-7" />
          </g>
        </>
      );
    case "whale":
      return (
        <>
          <g data-feature="whale-head">
            <path d="M80 53c11 0 20 3 26 10" />
            <path {...softFillProps} d="M78 54c8 0 15 2 20 7l-8 5c-4-5-8-8-14-12z" />
          </g>
          <path data-feature="whale-body" d="M29 68c10-18 28-28 48-28 16 0 30 8 38 20-6 1-12 4-14 8 4 4 6 8 6 14-10 0-18 4-24 10H47c-10 0-18-8-18-24z" />
          <g data-feature="whale-belly">
            <path d="M44 83c9 2 18 1 28-2" strokeWidth="4.5" />
            <path {...softFillProps} d="M41 81c10 2 19 1 29-2l-4 9c-9 3-18 3-27 1z" />
          </g>
          <g data-feature="whale-fin">
            <path d="M60 76l10 6" strokeWidth="4.5" />
            <path {...softFillProps} d="M60 77l8 4-5 2z" />
          </g>
          <g data-feature="whale-tail">
            <path d="M87 87l12 10m-2-14l16 6" />
            <path {...softFillProps} d="M90 86l8 7m0-7l10 4" />
          </g>
        </>
      );
    case "falcon":
      return (
        <>
          <g data-feature="falcon-beak">
            <path d="M80 47l15-4-11 11" />
            <path {...accentFillProps} d="M80 48l9-2-7 6" />
          </g>
          <g data-feature="falcon-brow">
            <path d="M60 58c8-8 16-11 24-10" strokeWidth="4.5" />
            <path {...softFillProps} d="M61 58c7-5 13-7 20-7l-3 6c-6 0-11 1-17 5z" />
          </g>
          <path data-feature="falcon-head" d="M43 77c4-20 16-34 34-39 9-3 17-2 24 3-6 3-10 8-12 14-3 12-11 22-24 29-7 3-13 5-18 5z" />
          <g data-feature="falcon-wing">
            <path d="M65 50l16-19m-7 23l17-5" />
            <path {...softFillProps} d="M65 51l11-13 2 9 9-3-9 8z" />
          </g>
          <g data-feature="falcon-chest">
            <path d="M53 81c8-2 16-6 24-12" strokeWidth="4.5" />
            <path {...softFillProps} d="M51 80c7-2 14-5 21-10l3 9c-7 5-14 8-21 8z" />
          </g>
        </>
      );
  }
}

export function PersonaBadge({ animalType, size = "md", variant = "soft" }: PersonaBadgeProps) {
  const persona = animalPersonas[animalType];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.72)] shadow-[var(--shadow-small)] ${sizeMap[size]}`}
      style={{
        background:
          variant === "paper"
            ? "linear-gradient(180deg, rgba(252,251,250,0.98) 0%, rgba(247,241,232,0.94) 100%)"
            : "linear-gradient(180deg, rgba(252,251,250,0.92) 0%, rgba(255,245,236,0.8) 100%)"
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-[10%] rounded-[24px] opacity-20"
        style={{ background: `radial-gradient(circle at 30% 25%, ${persona.accentColor}, transparent 70%)` }}
      />
      <svg
        viewBox="0 0 128 128"
        className="relative z-10 h-[72%] w-[72%]"
        fill="none"
        stroke={persona.accentColor}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: persona.accentColor }}
      >
        {iconStroke(animalType)}
      </svg>
    </div>
  );
}
