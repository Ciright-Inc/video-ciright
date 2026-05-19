> **Primary Brand Color Updated:** All black (`#000000`) CTA surfaces replaced with **Royal Navy** (`#003087`). Related surface darks, ink, and atmospheric gradients are re-derived from the same navy hue. Everything else (layout, typography, shapes, components) is unchanged.

---

## Overview

Expo's marketing site reads like a quietly-confident React-Native developer platform. The base canvas is **pure white** (`{colors.canvas}` — #ffffff) with a soft **navy-blue gradient atmospheric wash** behind the hero band. Near-black navy ink `{colors.ink}` (#0a1628) carries body and display alike. The single brand voltage is **Royal Navy** (`{colors.primary}` — #003087) for primary CTAs — minimal and editorial-feeling. A small blue text-link accent (`{colors.text-link}` — #1a56db) is reserved for inline body links, never as a CTA.

Type runs **Inter** as the single sans family at modest weights (display 600, body 400). JetBrains Mono carries every code surface. No custom typeface — the brand trusts Inter's editorial neutrality.

The brand's strongest visual signature is the **device-mockup hero** — a centered MacBook + iPhone composite showing real Expo dev surfaces (Expo Studio, EAS Build dashboard, the Expo Go simulator) — over a navy-blue gradient atmospheric wash. The composite is the page's chrome instead of an illustration.

**Key Characteristics:**
- Pure white canvas with navy-blue gradient atmospheric backdrop in hero only.
- Single primary CTA: Royal Navy pill at `{rounded.md}` (8px) — compact developer-tool dialect.
- Text-link blue (`{colors.text-link}`) for inline links only — never on a CTA.
- Inter as the single sans family — no custom display typeface.
- JetBrains Mono on every code surface.
- Device-mockup hero with real Expo product surfaces is the brand chrome.
- Hairline + soft drop depth; no atmospheric brand decoration outside the hero.
- 96px section rhythm.

---

## Colors

### Brand & Accent
- **Royal Navy** (`{colors.primary}` — #003087): Primary CTA fill. Used scarcely.
- **Navy Active** (`{colors.primary-active}` — #002070): Press state — one step deeper.
- **Navy Light** (`{colors.primary-light}` — #e8eef8): Tinted surface for callout backgrounds and hover fills.
- **Text Link Blue** (`{colors.text-link}` — #1a56db): Inline body links inside long-form copy. Scoped narrowly — never on CTAs.
- **Legal Link Blue** (`{colors.text-link-secondary}` — #3b5bdb): Inline links inside legal copy footer.
- **Bright Cyan** (`{colors.accent-link-bright}` — #47c2ff): Used very sparingly inside docs widget links.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): Pure white page floor.
- **Canvas Soft** (`{colors.canvas-soft}` — #fafafa): Subtle alternating band.
- **Surface Card** (`{colors.surface-card}` — #ffffff): Pure white card.
- **Surface Strong** (`{colors.surface-strong}` — #f0f2f8): Badges, ecosystem tiles, secondary buttons — lightly navy-tinted.
- **Surface Dark** (`{colors.surface-dark}` — #001a4d): Dark feature cards, code blocks, IDE mockups, featured pricing — deep navy.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — #002070): One step lighter inside dark navy cards.

### Atmospheric Backdrop
- **Navy Light** (`{colors.gradient-navy-light}` — #d0e0ff) + **Navy Mid** (`{colors.gradient-navy-mid}` — #a0bce8): The soft navy-blue gradient wash behind the homepage hero only. Not a brand action color.

### Hairlines
- **Hairline** (`{colors.hairline}` — #e8eef8): Default 1px divider — navy tinted.
- **Hairline Soft** (`{colors.hairline-soft}` — #f0f4fb): Lighter divider.
- **Hairline Strong** (`{colors.hairline-strong}` — #c8d4ec): Stronger panel outline — perceptibly navy.

### Text
- **Ink** (`{colors.ink}` — #0a1628): Display, body emphasis — very dark navy.
- **Body** (`{colors.body}` — #4a5568): Default running-text — cool blue-gray.
- **Body Strong** (`{colors.body-strong}` — #0a1628): Same as ink.
- **Muted** (`{colors.muted}` — #7a8599): Sub-titles — cool gray.
- **Muted Soft** (`{colors.muted-soft}` — #b8c4d8): Disabled text — muted navy.
- **On Primary** (`{colors.on-primary}` — #ffffff): White text on navy CTA.
- **On Dark** (`{colors.on-dark}` — #ffffff): White text on dark navy cards.
- **On Dark Soft** (`{colors.on-dark-soft}` — #a8b8d0): Muted off-white on dark navy.

### Semantic
- **Warning** (`{colors.accent-warning}` — #ab6400): Warning text inside docs callouts.
- **Preview** (`{colors.accent-preview}` — #8145b5): "Preview" tag color.
- **Success** (`{colors.semantic-success}` — #16a34a): Confirmation.
- **Error** (`{colors.semantic-error}` — #eb8e90): Validation errors.

---

## Typography

### Font Family
**Inter** is the single sans family across every text role. **JetBrains Mono** carries every code surface. Fallback: `-apple-system, system-ui, sans-serif`.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-mega}` | 64px | 600 | 1.05 | -1.92px | Homepage hero h1 |
| `{typography.display-xl}` | 48px | 600 | 1.1 | -1.44px | Subsidiary heroes |
| `{typography.display-lg}` | 36px | 600 | 1.15 | -1.08px | Section heads |
| `{typography.display-md}` | 28px | 600 | 1.2 | -0.84px | Sub-section heads |
| `{typography.display-sm}` | 22px | 600 | 1.25 | -0.5px | Card group titles |
| `{typography.title-md}` | 18px | 600 | 1.4 | 0 | Component titles |
| `{typography.title-sm}` | 16px | 600 | 1.4 | 0 | List labels |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default body |
| `{typography.body-sm}` | 14px | 400 | 1.5 | 0 | Footer body |
| `{typography.caption}` | 13px | 400 | 1.4 | 0 | Photo captions |
| `{typography.caption-uppercase}` | 11px | 600 | 1.4 | 0.88px | Section labels, badges |
| `{typography.code}` | 13px | 400 | 1.5 | 0 | Code blocks — JetBrains Mono |
| `{typography.button}` | 14px | 500 | 1.0 | 0 | CTA labels |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Top-nav menu |

### Principles
- **Display weight stays at 600** — confident but not bombastic. Inter at 600 reads cleaner than 700.
- **Negative letter-spacing on display** — -0.5px to -1.92px tracking.
- **JetBrains Mono on every code surface.**

### Note on Font Substitutes
Inter and JetBrains Mono are both freely available — the system uses them directly.

---

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.base}` 16px · `{spacing.md}` 20px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.
- **Section padding:** 96px.

### Grid & Container
- Max content width: ~1200px.
- Editorial body: 12-column grid.
- Feature card grids: 2-up at desktop for hero splits, 3-up for benefit grids.
- Ecosystem tile grid: 8-up at desktop.
- Footer: 5-column at desktop.

### Whitespace Philosophy
Generous editorial pacing. The white canvas does not compete with the hero's gradient navy wash; cards inside dense workflow sections sit close (16-24px gap).

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat (canvas) | `{colors.canvas}` (#ffffff) | Body bands, footer |
| Card | `{colors.surface-card}` (#ffffff) | Content cards |
| Hairline border | 1px `{colors.hairline}` (#e8eef8) | Card outlines |
| Soft drop | `0 4px 12px rgba(0, 48, 135, 0.06)` | Hovered cards (single shadow tier) — navy-tinted |
| Atmospheric gradient | Navy-blue radial wash | Hero backdrop only |
| Dark inversion | `{colors.surface-dark}` (#001a4d) | Dark feature cards, code blocks, featured pricing |

### Decorative Depth
- **Navy-blue gradient backdrop** in the hero only — atmospheric depth without claiming to be a brand color.
- **Device mockup composite** as page chrome — MacBook + iPhone showing real Expo dev surfaces.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Reserved |
| `{rounded.xs}` | 4px | Inline tags |
| `{rounded.sm}` | 6px | Compact rows |
| `{rounded.md}` | 8px | CTA buttons, form inputs, ecosystem tiles |
| `{rounded.lg}` | 12px | Feature cards, code blocks, pricing tiers |
| `{rounded.xl}` | 16px | Device mockup cards |
| `{rounded.xxl}` | 24px | Larger atmospheric cards (rare) |
| `{rounded.pill}` | 9999px | Badges only |
| `{rounded.full}` | 9999px | Avatar plates (rare) |

Compact developer-ergonomic radii — 8px CTAs, 12px cards. Pill geometry is reserved for badges, never CTAs.

---

## Components

### Top Navigation

**`top-nav`** — Background `{colors.canvas}`, text `{colors.ink}` (#0a1628), height 64px. Layout: Expo wordmark left, primary horizontal menu (Tools / Workflows / EAS / Pricing / Docs / Showcase), Sign In + Get started CTA right.

### Buttons

**`button-primary`** — Royal Navy pill. Background `{colors.primary}` (#003087), text `{colors.on-primary}` (#ffffff), type `{typography.button}` (14px / 500), padding 10px × 18px, height 40px, rounded `{rounded.md}` (8px).

**`button-primary-active`** — Press state. Background `{colors.primary-active}` (#002070).

**`button-secondary`** — White card with 1px hairline-strong border. Background `{colors.surface-card}`, text `{colors.ink}`, 1px `{colors.hairline-strong}` (#c8d4ec) border.

**`button-tertiary-text`** — Inline blue text link. Background transparent, text `{colors.text-link}` (#1a56db).

### Hero & Device Mockup

**`hero-band`** — Background `{colors.canvas}` with a soft navy-blue gradient wash behind the centered headline. Display headline in `{typography.display-mega}` (64px / 600 / -1.92px), subhead in `{typography.body-md}`, single primary CTA in Royal Navy, then below — the device mockup composite.

**`device-mockup-card`** — A layered MacBook + iPhone composite showing real Expo dev surfaces. Background `{colors.surface-card}`, rounded `{rounded.xl}`. The MacBook holds the EAS dashboard or Expo Studio screenshot; the iPhone overlay shows the running app in Expo Go. This is the page chrome.

### Cards

**`feature-card`** — Background `{colors.surface-card}`, text `{colors.ink}` (#0a1628), type `{typography.title-md}`, rounded `{rounded.lg}`, padding 24px, 1px `{colors.hairline-strong}` (#c8d4ec) border.

**`feature-card-dark`** — Dark variant. Background `{colors.surface-dark}` (#001a4d), text `{colors.on-dark}` (#ffffff). Same shape, deep navy inversion.

**`workflow-step-card`** — Step in the "Get your app on every device" workflow row. Background `{colors.surface-card}`, text `{colors.body}` (#4a5568), rounded `{rounded.lg}`, padding 20px. Layout: 32px square `{component.workflow-step-icon}` + step number + label + body.

**`workflow-step-icon`** — Square plate. Background `{colors.surface-strong}` (#f0f2f8), rounded `{rounded.md}`, 32px size.

**`testimonial-card`** — Quote card. Background `{colors.surface-card}`, text `{colors.body}` (#4a5568), rounded `{rounded.lg}`, padding 24px.

### Code & IDE

**`code-block`** — Inline code block. Background `{colors.surface-dark}` (#001a4d), text `{colors.on-dark}` (#ffffff) in `{typography.code}` (JetBrains Mono 13px), rounded `{rounded.lg}`, padding 20px. White text on deep navy.

**`ide-mockup-card`** — Stylized IDE mockup. Background `{colors.surface-dark}` (#001a4d), rounded `{rounded.lg}`. Multi-pane editor + terminal preview.

### Pricing

**`pricing-tier-card`** — Standard pricing tier. Background `{colors.surface-card}`, rounded `{rounded.lg}`, padding 32px, 1px `{colors.hairline-strong}` border.

**`pricing-tier-featured`** — Featured tier. Background `{colors.surface-dark}` (#001a4d), text `{colors.on-dark}` (#ffffff). Same shape, deep navy inversion.

### Ecosystem

**`ecosystem-tile`** — Square logo plate for ecosystem partner logos (TypeScript, React, Sentry, etc.). Background `{colors.surface-card}`, rounded `{rounded.md}`, 64px size, 1px `{colors.hairline}` (#e8eef8) border.

### Forms & Tags

**`text-input`** — Background `{colors.surface-card}`, text `{colors.ink}` (#0a1628), rounded `{rounded.md}` (8px), padding 12px × 16px, height 44px, 1px `{colors.hairline-strong}` (#c8d4ec) border. Focus thickens border to 2px Royal Navy (#003087).

**`badge-pill`** — Small uppercase pill. Background `{colors.surface-strong}` (#f0f2f8), text `{colors.ink}` (#0a1628), type `{typography.caption-uppercase}`, rounded `{rounded.pill}`, padding 4px × 10px.

### CTA / Footer

**`cta-band`** — Pre-footer band. Background `{colors.canvas}`, centered display headline in `{typography.display-lg}`, single Royal Navy pill CTA. 96px padding.

**`footer-light`** — Closing white footer. Background `{colors.canvas}`, text `{colors.body}` (#4a5568). 5-column link list. 64×48px padding.

**`footer-link`** — Background transparent, text `{colors.body}` (#4a5568), type `{typography.body-sm}`.

---

## Color Token Reference (Quick Lookup)

| Token | Old Hex (Black Theme) | New Hex (Navy Theme) | Change |
|---|---|---|---|
| `{colors.primary}` | #000000 | **#003087** | ✦ Updated |
| `{colors.primary-active}` | #1a1a1a | **#002070** | ✦ Updated |
| `{colors.primary-light}` | — | **#e8eef8** | ✦ New |
| `{colors.text-link}` | #0d74ce | **#1a56db** | ✦ Updated |
| `{colors.text-link-secondary}` | #476cff | **#3b5bdb** | ✦ Updated |
| `{colors.surface-strong}` | #f0f0f3 | **#f0f2f8** | ✦ Updated |
| `{colors.surface-dark}` | #171717 | **#001a4d** | ✦ Updated |
| `{colors.surface-dark-elevated}` | #1a1a1a | **#002070** | ✦ Updated |
| `{colors.gradient-sky-light}` | #cfe7ff | **#d0e0ff** | ✦ Updated |
| `{colors.gradient-sky-mid}` | #a8c8e8 | **#a0bce8** | ✦ Updated |
| `{colors.hairline}` | #f0f0f3 | **#e8eef8** | ✦ Updated |
| `{colors.hairline-soft}` | #f5f5f7 | **#f0f4fb** | ✦ Updated |
| `{colors.hairline-strong}` | #dcdee0 | **#c8d4ec** | ✦ Updated |
| `{colors.ink}` | #171717 | **#0a1628** | ✦ Updated |
| `{colors.body}` | #60646c | **#4a5568** | ✦ Updated |
| `{colors.body-strong}` | #171717 | **#0a1628** | ✦ Updated |
| `{colors.muted}` | #999999 | **#7a8599** | ✦ Updated |
| `{colors.muted-soft}` | #cccccc | **#b8c4d8** | ✦ Updated |
| `{colors.on-dark-soft}` | #b0b4ba | **#a8b8d0** | ✦ Updated |
| `{colors.canvas}` | #ffffff | #ffffff | — Unchanged |
| `{colors.canvas-soft}` | #fafafa | #fafafa | — Unchanged |
| `{colors.surface-card}` | #ffffff | #ffffff | — Unchanged |
| `{colors.on-primary}` | #ffffff | #ffffff | — Unchanged |
| `{colors.on-dark}` | #ffffff | #ffffff | — Unchanged |

---

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` (Royal Navy #003087) for primary CTAs.
- Use `{colors.text-link}` (#1a56db) for inline body links only — never on CTAs or buttons.
- Set every CTA at `{rounded.md}` (8px) — developer dialect.
- Use Inter at weight 600 for display, 400 for body.
- Render every code surface in JetBrains Mono.
- Pair the hero with the device-mockup composite — it's the page chrome.

### Don't
- Don't introduce a saturated brand action color. Royal Navy (#003087) is the only CTA fill.
- Don't use `{colors.text-link}` (#1a56db) on a CTA. Inline links only.
- Don't drop display below weight 600 or above 700.
- Don't use full pills on CTAs — pills are for badges only.
- Don't replicate the navy-blue gradient backdrop outside the hero.
- Don't substitute a lighter navy or blue for the primary CTA — #003087 is the canonical value.

---

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Hero h1 64→32px; device mockup → single iPhone screen; feature grid 1-up; nav hamburger. |
| Tablet | 640–1024px | Hero h1 48px; device mockup compresses; feature grid 2-up. |
| Desktop | 1024–1280px | Full hero h1 64px; full MacBook + iPhone composite; feature grid 3-up. |
| Wide | > 1280px | Content caps at 1200px. |

### Touch Targets
- Primary CTA at 40px height — at WCAG AA, padded for AAA.
- Search input 44px — at AAA.

### Collapsing Strategy
- Top nav switches to hamburger below 768px.
- Device mockup MacBook + iPhone collapses to a single iPhone preview on mobile.
- Feature grid: 3-up → 2-up → 1-up.
- Ecosystem tile grid: 8-up → 4-up → 3-up → 2-up.

---

## Iteration Guide

1. Focus on a single component at a time.
2. CTAs default to `{rounded.md}` (8px). Cards use `{rounded.lg}` (12px).
3. Variants live as separate entries.
4. Use `{token.refs}` everywhere — never inline hex.
5. Hover state never documented.
6. Inter 600 for display, Inter 400 for body. JetBrains Mono on code.
7. Royal Navy (#003087) stays the only CTA color; text-link blue (#1a56db) stays inline-only.

---

## Known Gaps

- Inter and JetBrains Mono are freely available — no licensing concerns.
- Animation timings (device mockup parallax, hero entrance) out of scope.
- In-app surfaces (EAS dashboard interactive, Expo Go simulator) only partially captured via marketing mockups.
- Form validation states beyond focus not visible on captured surfaces.
