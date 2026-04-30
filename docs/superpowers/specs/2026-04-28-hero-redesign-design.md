---
title: Hero Section Redesign
date: 2026-04-28
status: approved
---

## Overview

Redesign the hero section of the portfolio to feature a clean, depth-layered layout inspired by hilonishah.com — with the portrait photo fully visible, no overlays, and per-word scroll-driven animations.

## Layout & Layering

Three z-index layers:

| Layer | z-index | Content |
|-------|---------|---------|
| Back  | 0       | "RIAZ" text |
| Mid   | 1       | Portrait photo (object-contain, no gradient overlay) |
| Front | 10      | "AHMED" text + info bar (status, divider, CTAs) |

## Photo Treatment

- `object-contain` + `object-center` (already set — keep)
- Remove the `linear-gradient` overlay div that was darkening the image
- The image must be fully visible on both mobile and desktop within `100dvh`
- No cropping, no gradient on top of the photo

## Scroll Animations (per-word, independent)

| Element | x transform | opacity |
|---------|-------------|---------|
| RIAZ    | 0% → -40%  | 1 → 0   |
| AHMED   | 0% → +40%  | 1 → 0   |

- Scroll range: `[0, 500]` for both x and opacity
- Each word gets its own `useTransform` hooks for `x` and `opacity`
- The existing `fadeOut` (whole overlay) is removed; bottom info bar gets its own fade

## Bottom Info Bar

- Status line, horizontal divider, and CTA buttons remain at the same position
- They fade out using a dedicated `useTransform` on `opacity` over `[0, 350]`
- No x-translation on the info bar

## Scroll parallax on image

- Keep existing `imgScale` and `imgY` parallax on the image wrapper — these are subtle and add depth
