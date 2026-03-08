# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CoSpark homepage design direction explorations. Six standalone HTML pages (A-F), each presenting a different visual approach to the CoSpark homepage. An `index.html` serves as a direction picker with screenshot previews and descriptions.

This is a sub-project within `clients/cospark/` — see the parent `CLAUDE.md` for the broader brand system (brand.css tokens, layout.css, fonts, dark mode, etc.).

## Development

No build step. Edit HTML/CSS and open in a browser. Push to `main` to deploy via GitHub Pages.

## Architecture

Each direction is a self-contained single-file HTML page (`direction-{a-f}.html`) with:
- Inline `<style>` block containing all page-specific CSS (reset, layout, animations, responsive)
- Inline `<script>` at the bottom for scroll-triggered animations (IntersectionObserver-based)
- `../brand.css` linked for design tokens (colors, fonts, weights)
- Google Fonts loaded via `<link>` tags (DM Sans + Source Serif 4)
- No shared layout.css — each direction has its own complete layout since they explore fundamentally different approaches

`direction-f2.html` is a variant/iteration of Direction F.

### Direction index (`index.html`)

Dark-themed card grid (`slate-950` background) linking to each direction. Cards show screenshot previews from `previews/`, titles, subtitles, descriptions, and tags. Color-coded accent bars on hover via `data-accent` attribute.

## Content Sources

- `copy/CoSpark_Homepage_Copy.docx.md` — Approved homepage copy (7 sections: hero, problem, different path, commonwealth, audience paths, testimonials, final CTA, footer)
- `copy/CoSpark_Individuals_Families_Page_Copy_v7.docx.md` — Individuals & families subpage copy
- `copy/CoSpark_Businesses_Page_Copy_v2.docx.md` — Businesses subpage copy

All direction pages should use the approved copy from these files. The homepage copy defines the section structure: Hero, Problem, Different Path (patina bg), Commonwealth, Audience Paths (ember bg), Testimonials, Final CTA (dark bg), Footer.

## Assets

- `images/` — Photography (hero, building, garden, workshop, etc.) and tile composition SVG
- `icons/` — Service category icons in SVG + PNG (education, community, growth, etc.)
- `previews/` — Screenshot thumbnails of each direction for the index page

## Conventions

- All colors via `brand.css` custom properties — never hardcode hex values
- Scroll animations use IntersectionObserver with `threshold` and `rootMargin`, not scroll event listeners
- Responsive breakpoint varies by direction but generally targets mobile at 768px or 640px
- Each direction includes a `no-js` / `js` class swap on `<html>` for progressive enhancement
- Grain texture overlay on `body::before` is a common pattern across directions
