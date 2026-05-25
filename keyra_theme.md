# Design System — `keyra_theme.md`

> **Implementation:** token values live in [`themes/keyra.theme.ts`](themes/keyra.theme.ts). Set `activeTheme` to `"keyra"` in [`themes/theme.config.ts`](themes/theme.config.ts), then run `npm run theme:generate`.

A single, consistent visual language for two surfaces:

- **Part 1 — Public Website** (Home / Landing / Hero / detail pages) — generous, editorial, breathing room.
- **Part 2 — Dashboard** (signed-in admin / data UI) — denser, tighter, smaller type, but **same fonts, same buttons, same hover behavior, same colors**.

**Design goal:** look intentional and modern. Not "blank-page minimal", not "decorated/fancy". A clean editorial system with strong typography, calm surfaces, and one accent for action. **No gradient colors.** Solid fills only.

---

## Theme rules — the non-negotiables

These rules outrank everything below. If a component is in conflict, the component is wrong.

### TR-1 — One color per button

Every button uses **exactly one solid color** for its background and **exactly one solid color** for its text. No gradient. No two-tone. No color-on-color border (the border, if present, is the system hairline `#dcdee0`, never a tint of the button color).

| Button | Background | Text | Border | Hover changes only |
|--------|-----------|------|--------|--------------------|
| Primary | `#000000` | `#ffffff` | none | background → `#1a1a1a` |
| Secondary | `#ffffff` | `#171717` | `1px #dcdee0` | background → `#fafafa` |
| Tertiary (link-like) | transparent | `#0d74ce` | none | text → `#476cff` |
| Destructive (rare) | `#ffffff` | `#dc2626` | `1px #dcdee0` | background → `#fafafa` |
| Icon button | transparent | `#171717` | none | background → `#fafafa` |

Rules that follow from this:
- A button is **never** filled with the link blue `#0d74ce`. Blue is for inline text links and tertiary buttons only.
- A button is **never** filled with a semantic color (`success`, `error`, `warning`). Semantics appear as inline text, icon color, or a left border on banners — not as a button fill.
- Hover **only** swaps the single fill color (or text color for tertiary). It never changes the border, the radius, the size, or adds a shadow/glow.
- No "ghost" buttons with a colored border (e.g. blue border + blue text). If it isn't filled with `#000` or surrounded by `#dcdee0`, it isn't a button — it's a tertiary text-button.

### TR-2 — Border-radius per element type (fixed)

Each element type has **one** radius. Never improvise per-component.

| Element | Radius | Token |
|---------|--------|-------|
| Primary / Secondary button (default 40px) | **8px** | `--ds-radius-md` |
| Small button (`is-sm`, 32px tall) | **6px** | `--ds-radius-sm` |
| Icon button (square 40×40) | **8px** | `--ds-radius-md` |
| Text input / select / textarea | **8px** | `--ds-radius-md` |
| Checkbox | **4px** | `--ds-radius-xs` |
| Radio | **9999px** (circle) | `--ds-radius-pill` |
| Switch track | **9999px** (pill) | `--ds-radius-pill` |
| Card (`.ds-feature-card`, `.ds-panel`) | **12px** | `--ds-radius-lg` |
| Modal / dialog | **12px** | `--ds-radius-lg` |
| Dropdown / menu / popover | **8px** | `--ds-radius-md` |
| Tooltip | **6px** | `--ds-radius-sm` |
| Toast | **12px** | `--ds-radius-lg` |
| Hero / media thumbnail (large) | **16px** | `--ds-radius-xl` |
| Card thumbnail (inside card) | **8px** | `--ds-radius-md` |
| Avatar | **9999px** (circle) | `--ds-radius-pill` |
| Badge / chip / tag | **9999px** (pill) | `--ds-radius-pill` |
| Table / table cells | **0px** (no rounding on cells) | — |
| Outer table container | **12px** | `--ds-radius-lg` |
| Skeleton block | matches the element it stands in for | — |
| Tag-like code/inline-code | **4px** | `--ds-radius-xs` |
| Progress bar | **9999px** | `--ds-radius-pill` |
| Range slider thumb | **50%** (circle) | — |

Nothing in the system uses a radius larger than **16px**. Nothing uses a radius between the table values (no `10px`, no `14px`).

### TR-3 — Borders are one color, one weight

- Every border in the system is `1px solid #dcdee0` (`--ds-hairline-strong`).
- The only exceptions: input focus ring (`2px solid #171717`), error field (`1px solid #dc2626`), sidebar active row left bar (`2px solid #ffffff`).
- Borders are **never** colored to match the element (no blue border on a blue chip, no green border on a success card).
- Dividers inside content (between table rows, between list items, between toolbar groups) use the lighter hairline `1px solid #f0f0f3` so cards still pop against rows.

### TR-4 — Surfaces are one of four greys

- `#ffffff` (canvas, cards, dropdowns, modals)
- `#fafafa` (dashboard background, row hover, table header)
- `#f0f0f3` (chips, muted pills, sorted/selected backgrounds)
- `#171717` (dark sidebar, dark accent card)

If a designer asks for a fifth grey, the answer is **no**.

### TR-5 — No gradients, no glassmorphism, no glow

- No `linear-gradient`, `radial-gradient`, or `conic-gradient` on backgrounds, buttons, cards, headers, banners, or text.
- No `backdrop-filter: blur()` UI surfaces (no frosted glass nav, no frosted modal).
- No `text-shadow`, no neon, no animated background.
- The single permitted scrim is **on top of media** (a dark-to-transparent overlay on a thumbnail so white text reads). That is image treatment, not brand color.

### TR-6 — One shadow, one transition

- Shadow: `0 4px 12px rgba(0,0,0,0.04)` — used **only** on card hover and on dropdown/popover/modal/toast/tooltip surfaces.
- Buttons never carry a shadow at rest or on hover.
- Transition: `150–220ms ease` on `background-color`, `border-color`, `color`, `box-shadow`, and `transform: translateY(1px)` for the press state. No spring, no bounce, no scale, no rotate.

### TR-7 — Color does one job at a time

| Color | Job — and *only* this job |
|-------|---------------------------|
| `#000000` | Primary button fill |
| `#171717` (ink) | Body text, primary heading, dark surface |
| `#60646c` (body) | Secondary text, muted captions |
| `#999999` (muted) | Tertiary meta, placeholder, disabled icon |
| `#0d74ce` (link) | Inline text links, tertiary button text |
| `#dc2626` (error) | Inline error text, error icon, error field border |
| `#16a34a` (success) | Success icon, success delta caption (the +/- glyph) |
| `#ab6400` (warning) | Warning icon, warning text |
| `#dcdee0` (border) | Borders |
| `#f0f0f3` (chip bg) | Chip background, hover-chip, sorted column bg |
| `#fafafa` (canvas soft) | Dashboard canvas, row hover |

A color does not change role across surfaces. Link blue is never a button fill in the dashboard. Error red is never a button background on the website. Etc.

### TR-8 — Hover changes one property

Hover on any interactive element changes exactly **one** visual property:
- Buttons → background (or text color, for tertiary) only.
- Cards → box-shadow only.
- Rows → background only.
- Links → text color only.
- Icon buttons → background only.

No hover ever changes the radius, the size, the position, the border, or the typography weight.

### TR-9 — Density does not change identity

Between website (Part 1) and dashboard (Part 2), the things that can change are: **padding, gap, font size, max-width, density toggle**. The things that **cannot** change are: font family, button colors, button radius (8px), card radius (12px), border color, hover behavior, shadow, motion timings.

A button placed on the dashboard must be visually identical to a button placed on the marketing site at the same `min-height`.

### TR-10 — Iconography is one set

- All icons are **Material Symbols Outlined** at `wght: 400`, `FILL: 0`, `GRAD: 0`, `opsz: 24`.
- Icon size: **20px** inside buttons/inputs, **24px** in section headers, **16px** in dense table cells.
- Icons inherit `currentColor`. Never hard-code icon color.
- Mixing icon families (e.g. Lucide + Material) is forbidden.

---

## 0. Shared foundations (apply to BOTH surfaces)

Everything in Part 1 and Part 2 inherits from this section. Only spacing, font sizes, and density change between the two parts.

### 0.1 Fonts

| Role | Font | Source |
|------|------|--------|
| UI + Display | **Inter** | `next/font/google`, exposed as `--font-inter` |
| Accent / numerics / IDs / timestamps | **Montserrat** | `next/font/google`, exposed as `--font-montserrat` |
| Icons | **Material Symbols Outlined** | `<link>` in `<head>`, used as `<span class="material-symbols-outlined">name</span>` |

**Inter** is the default for body, nav, and most UI. **Montserrat** is a geometric sans used where numbers, IDs, or short code-like strings need clear emphasis (dashboard tables, KPIs, tooltips) — not a monospace face; true `<pre>` / dev tools can still use `globals.css` `--font-mono` (system stack).

```css
--font-sans: var(--font-inter), Inter, -apple-system, system-ui, sans-serif;
--font-accent: var(--font-montserrat), Montserrat, sans-serif;
```

**Weights used:** Inter 400 / 500 / 600; Montserrat 400 / 500 / 600 (loaded in `layout.tsx`). No 700+ for display. No italic display.

**Letter-spacing:** display sizes use a slight negative tracking (`-0.03em` / `-1.92px` at the largest) for a modern editorial feel. Body is `0`. Eyebrows / caps labels use `+0.08em`.

### 0.2 Color tokens (solid only — no gradients)

```css
/* Surfaces */
--ds-canvas:           #ffffff;   /* page background */
--ds-canvas-soft:      #fafafa;   /* alt zebra / hover bg */
--ds-surface-card:     #ffffff;   /* card body */
--ds-surface-strong:   #f0f0f3;   /* chip / muted pill */
--ds-surface-dark:     #171717;   /* inverted card / dashboard sidebar */

/* Borders */
--ds-hairline:         #f0f0f3;   /* whisper divider */
--ds-hairline-soft:    #f5f5f7;
--ds-hairline-strong:  #dcdee0;   /* default border */

/* Text */
--ds-ink:              #171717;   /* primary text */
--ds-body:             #60646c;   /* secondary text */
--ds-muted:            #999999;   /* meta / caption */
--ds-muted-soft:       #cccccc;   /* placeholders */
--ds-on-primary:       #ffffff;   /* text on black button */
--ds-on-dark:          #ffffff;   /* text on dark surface */

/* Action / link */
--ds-primary:          #000000;   /* primary CTA fill */
--ds-primary-active:   #1a1a1a;   /* primary CTA hover */
--ds-text-link:        #0d74ce;   /* inline links */
--ds-text-link-2:      #476cff;   /* link hover */

/* Semantic */
--ds-success:          #16a34a;
--ds-error:            #dc2626;
--ds-warning:          #ab6400;
```

**Hard rules:**
- The only fully black thing on the page is the **primary button**. Body text is `#171717` ink, never pure black.
- Links are `#0d74ce` (inline, in copy). Buttons never use link blue.
- **No `linear-gradient()` on buttons, cards, headers, or hero backgrounds.** Solid fills only. The only allowed "wash" is a faint white-over-image scrim on media (e.g. text-on-thumbnail), which is not a brand gradient.
- Borders are always `#dcdee0`. Never colored.

### 0.3 Radii

```css
--ds-radius-xs: 4px;    /* tags, inline tokens */
--ds-radius-sm: 6px;    /* small inputs */
--ds-radius-md: 8px;    /* buttons, default inputs */
--ds-radius-lg: 12px;   /* cards, panels */
--ds-radius-xl: 16px;   /* hero media */
--ds-radius-pill: 9999px; /* chips, badges */
```

Buttons = `md` (8px). Cards = `lg` (12px). Chips = `pill`. Nothing larger than `xl`.

### 0.4 Elevation (one shadow only)

```css
--ds-shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.04);
```

That is the **only** shadow in the system. Used on hover for cards. Nav, buttons, and panels do not carry a shadow at rest.

### 0.5 Motion

| Use | Value |
|------|-------|
| Button bg / border color | `transition: background-color 0.2s ease, border-color 0.2s ease` |
| Button press | `transition: transform 0.15s ease` then `:active { transform: translateY(1px); }` |
| Card hover | `transition: box-shadow 0.2s ease` |
| Link color | `transition: color 0.2s ease` |
| Input focus | `transition: border-color 0.2s ease` |

No bounce, no spring, no slow fades. 150–220ms `ease`. Respect `prefers-reduced-motion`.

### 0.6 Buttons (one component, one behavior, both surfaces)

The button looks identical on the website and the dashboard. Only padding differs slightly (Part 2 has a `sm` size variant).

#### Primary — black, white text

```css
.ds-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 10px 18px;
  background: var(--ds-primary);    /* #000 */
  color:      var(--ds-on-primary); /* #fff */
  font: 500 14px/1 var(--font-sans);
  border: none;
  border-radius: var(--ds-radius-md); /* 8px */
  cursor: pointer;
  transition: background-color .2s ease, transform .15s ease;
}
.ds-btn-primary:hover   { background: var(--ds-primary-active); } /* #1a1a1a */
.ds-btn-primary:active  { transform: translateY(1px); }
.ds-btn-primary:disabled{ opacity: .55; cursor: not-allowed; }
```

#### Secondary — white surface, black text, hairline border

```css
.ds-btn-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 10px 18px;
  background: var(--ds-surface-card);  /* #fff */
  color:      var(--ds-ink);           /* #171717 */
  font: 500 14px/1 var(--font-sans);
  border: 1px solid var(--ds-hairline-strong); /* #dcdee0 */
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  transition: background-color .2s ease, border-color .2s ease;
}
.ds-btn-secondary:hover { background: var(--ds-canvas-soft); } /* #fafafa */
```

#### Tertiary / link-button — no chrome, color shifts on hover

```css
.ds-btn-tertiary {
  background: transparent; border: none; padding: 8px 0;
  color: var(--ds-text-link);          /* #0d74ce */
  font: 500 14px/1 var(--font-sans);
  cursor: pointer;
  transition: color .2s ease;
}
.ds-btn-tertiary:hover { color: var(--ds-text-link-2); } /* #476cff */
```

#### Icon button (square)

40×40px, transparent bg, `border-radius: 8px`. On hover: `background: var(--ds-canvas-soft)`. Used for play/pause, close, more-actions, drawer toggle.

#### Disabled state (all variants)

`opacity: .55; cursor: not-allowed;` — never grey out borders or change colors.

### 0.7 Inputs

```css
.ds-text-input {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  background: var(--ds-surface-card);
  color: var(--ds-ink);
  font-size: 16px;                 /* 16px prevents iOS zoom */
  border: 1px solid var(--ds-hairline-strong);
  border-radius: var(--ds-radius-md);
  outline: none;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.ds-text-input:focus {
  border-width: 2px;
  border-color: var(--ds-ink);
  padding: 11px 15px;              /* compensate for thicker border */
}
```

Global focus ring fallback for any focusable element:
```css
:focus-visible { outline: 2px solid var(--ds-ink); outline-offset: 3px; }
```

### 0.8 Cards & panels

```css
.ds-feature-card {
  background: var(--ds-surface-card);
  border: 1px solid var(--ds-hairline-strong);
  border-radius: var(--ds-radius-lg); /* 12px */
  padding: 24px;
  transition: box-shadow .2s ease;
}
.ds-feature-card:hover { box-shadow: var(--ds-shadow-soft); }
```

`.ds-panel` is the same with `padding: clamp(20px, 3vw, 28px)` for larger content blocks. Dark variant (`.ds-feature-card-dark`) uses `--ds-surface-dark` background and `--ds-on-dark` text — used sparingly for emphasis blocks (e.g. CTA strip).

### 0.9 Badges & chips

```css
.ds-badge-pill {
  display: inline-flex; align-items: center;
  padding: 4px 10px;
  background: var(--ds-surface-strong); /* #f0f0f3 */
  color: var(--ds-ink);
  font: 600 11px/1.4 var(--font-sans);
  letter-spacing: .08em;
  text-transform: uppercase;
  border-radius: 9999px;
}
```

### 0.10 Links inside copy

```css
.ds-text-link { color: #0d74ce; text-decoration: underline; text-underline-offset: 2px; }
.ds-text-link:hover { color: #476cff; }
```

### 0.11 Scrollbar

Thin (6px), track `#fafafa`, thumb `#dcdee0`. Same on both surfaces.

### 0.12 Hover effect rules (apply everywhere)

| Element | Rest | Hover |
|---------|------|-------|
| Primary button | `#000` bg | `#1a1a1a` bg |
| Secondary button | `#fff` bg, `#dcdee0` border | `#fafafa` bg (border stays) |
| Tertiary / link-button | `#0d74ce` text | `#476cff` text |
| Icon button | transparent | `#fafafa` bg |
| Card | no shadow | `0 4px 12px rgba(0,0,0,.04)` |
| Inline link | `#0d74ce` underline | `#476cff` underline |
| Nav link | `#60646c` | `#171717` |
| Row in a list / table | `#ffffff` | `#fafafa` |
| Chip / tag | `#f0f0f3` bg | `#dcdee0` bg |

No scale, no lift, no glow. Hovers are color/background only, plus the single soft shadow on cards.

---

## Part 1 — Public Website (home, landing, hero, detail)

The marketing-facing surface. Reads like a magazine. **More whitespace, larger type, fewer items per row.**

### 1.1 Page shell

- Background: `#ffffff`.
- Max content width: **1200px**, centered.
- Horizontal page padding: `clamp(20px, 4vw, 48px)`.
- Vertical section rhythm: **`96px`** between top-level sections.
- Sticky top nav: **64px** tall, `#ffffff` bg, no border at rest. After scrolling > 8px, add a `1px` bottom border (`#dcdee0`). Never a shadow.

### 1.2 Typography scale (website)

| Class | Use | Size (responsive) | Weight | Line-height | Tracking |
|-------|-----|-------------------|--------|-------------|----------|
| `.ds-display-mega` | Hero H1 | `clamp(2rem, 5vw, 4rem)` (32 → 64px) | 600 | 1.05 | −0.03em |
| `.ds-display-xl`   | Section hero / page H1 | `clamp(1.75rem, 4vw, 3rem)` (28 → 48px) | 600 | 1.10 | −0.03em |
| `.ds-display-lg`   | Sub-hero / section title | `clamp(1.5rem, 3vw, 2.25rem)` (24 → 36px) | 600 | 1.15 | −0.03em |
| `.ds-display-md`   | Card group title | `1.75rem` (28px) | 600 | 1.20 | −0.03em |
| `.ds-title-md`     | Card title | `1.125rem` (18px) | 600 | 1.40 | 0 |
| `.ds-body-md`      | Lead paragraph / body | `1rem` (16px) | 400 | 1.50 | 0 |
| `.ds-body-sm`      | Card body | `0.875rem` (14px) | 400 | 1.50 | 0 |
| `.ds-caption-uppercase` | Eyebrows / labels | `0.6875rem` (11px) | 600 | 1.40 | +0.08em, UPPERCASE |

**Hero block:**
- Eyebrow (`.ds-caption-uppercase`, muted) → tight 8px gap →
- H1 (`.ds-display-mega`) → 16px gap →
- Lead (`.ds-body-md`, max 60ch) → 32px gap →
- Two buttons in a row (primary + secondary), 12px gap between them.

### 1.3 Spacing scale (website)

```
xxs  4px     xs   8px     sm  12px
base 16px    md  20px     lg  24px
xl  32px     xxl 48px     section 96px
```

- Element-to-element inside a card: **16–24px**.
- Card padding: **24px**.
- Section padding (top + bottom): **96px** desktop, **64px** ≤768px.
- Hero column gap: **48px** desktop, **32px** stacked.

### 1.4 Hero section (landing)

- Two-column grid on desktop: `1fr 1fr`, gap `48px`. Stacks ≤960px.
- Left column: eyebrow, H1, lead, button row, optional topic chip row, optional 3-up stat cards row.
- Right column: a single hero media card (16:9 thumbnail, `border-radius: 16px`, optional play overlay). Card uses `.ds-feature-card` but with no border (image fills) and one allowed dark scrim from the image bottom up — *image content only, not a brand color gradient*.
- Background of the hero band: solid `#ffffff` (no gradient).

### 1.5 Buttons in the hero

- Primary: "Start Listening" / "Get Started" — `.ds-btn-primary`, 40px tall.
- Secondary: "Play Featured" / "Browse" — `.ds-btn-secondary`, 40px tall.
- Both buttons share `border-radius: 8px`, the same hover behavior defined in §0.6.

### 1.6 Cards (podcast / feature)

- `.ds-feature-card` — 24px padding, 12px radius, 1px hairline border, white surface.
- Inside: thumbnail (radius 8px) → 16px gap → category chip → 8px → title (`.ds-title-md`) → 8px → 2-line description (`.ds-body-sm`) → 16px → meta row (duration / views).
- Grid: `repeat(auto-fill, minmax(280px, 1fr))`, gap **24px**.
- Hover: soft shadow only (no lift, no scale).

### 1.7 Section header pattern

```
[ICON 24px]  Section title (.ds-display-md)
             Subtitle (.ds-body-md, muted)               [optional count badge]
```

24px between icon and text. 64px gap between section header and the grid below it. 96px between sections.

### 1.8 Footer

- Top hairline `1px #dcdee0`.
- Vertical padding `48px`.
- Type: `.ds-body-sm` muted.
- Single row on desktop, stacked on mobile.

---

## Part 2 — Dashboard

The signed-in / admin surface. Information-dense. **Smaller type, tighter spacing, more rows per screen** — but every button, color, font, hover effect, radius, and border matches Part 1.

### 2.1 Page shell

- Background: `#fafafa` (canvas-soft) for the main area so cards/panels (`#ffffff`) read as elevated.
- Layout: **fixed left sidebar 240px** (collapsed: 64px), content fills remaining width.
- Sidebar background: `#171717` (`--ds-surface-dark`), text `#ffffff`, hover row `rgba(255,255,255,0.08)`, active row `rgba(255,255,255,0.12)` with a 2px left accent bar in `#ffffff`. Sidebar uses **same Inter font** at 14px / weight 500.
- Top bar inside the content column: **56px** tall (vs 64px on the website), white, `1px` bottom border `#dcdee0`, no shadow.
- Content max-width: **none** (fluid), but inner page padding is `24px` (≤1280px) → `32px` (>1280px). No 1200px clamp.

### 2.2 Typography scale (dashboard)

Same families, same weights, **one step smaller** across the board:

| Role | Class equivalent | Size | Weight | Line-height |
|------|-----------------|------|--------|-------------|
| Page title (H1) | dashboard `display-sm` | **22px** | 600 | 1.25 |
| Section / card title | `title-md` | **16px** | 600 | 1.40 |
| Sub-section label | `title-sm` | **14px** | 600 | 1.40 |
| Body | `body-sm` | **14px** | 400 | 1.50 |
| Meta / helper | `caption` | **13px** | 400 | 1.40 |
| Table / data row | `body-sm` | **14px** | 400 | 1.40 |
| Numeric values (KPI big number) | display | **28px** | 600 | 1.20 |
| Numeric in tables | Montserrat | **13px** | 400 | 1.40 |
| Caps eyebrow | uppercase | **11px** | 600 | 1.40, +.08em |

No 48px / 64px display sizes anywhere in the dashboard. The biggest type on screen is a KPI number at **28px**.

### 2.3 Spacing scale (dashboard)

Tighter than the website. Reuses the same tokens, but defaults to one step smaller.

```
Element gap inside a card:  12px (vs 16–24px on site)
Card padding:               16–20px (vs 24px)
Card-to-card gap in grid:   16px (vs 24px)
Section top/bottom padding: 24–32px (vs 96px)
Form field vertical gap:    16px
Table row height:           44px (comfortable) / 36px (compact toggle)
```

### 2.4 Buttons (dashboard) — same look, new `sm` size

Default buttons are identical to Part 1 (40px tall, 10×18 padding, 14px text). A `sm` variant is added for inline / toolbar use:

```css
.ds-btn-primary.is-sm,
.ds-btn-secondary.is-sm {
  min-height: 32px;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;          /* radius-sm */
}
```

Hover, active, disabled behavior is unchanged. **Never** introduce a new color, a gradient, or a different radius for dashboard buttons.

### 2.5 Cards / panels (dashboard)

- Same `.ds-feature-card` recipe: white, 1px `#dcdee0` border, `12px` radius, soft-shadow hover.
- Padding **20px** (instead of 24px).
- KPI card: eyebrow caption (uppercase muted) → 8px → big number (28px / 600 ink) → 4px → delta caption (14px, color `--ds-body`, optional success/error semantic color only on the +/- glyph, not the whole text).

### 2.6 Tables

```
border:        none on table itself
row divider:   1px solid #f0f0f3 (hairline, not hairline-strong)
header row:    #fafafa background, 11px uppercase 600 letter-spacing .08em, color #60646c
cell padding:  12px 16px (comfortable) / 8px 12px (compact)
row hover:     background #fafafa
selected row:  background #f5f5f7
numeric cells: text-align right, Montserrat 13px
```

Sort caret = a 16px Material Symbol next to the header label, color `#999999` at rest, `#171717` when active. No colored backgrounds on sorted columns.

### 2.7 Forms (dashboard)

- Inputs: same `.ds-text-input` recipe, but `min-height: 36px` and `padding: 8px 12px` for dense forms. Font stays 14px (still ≥14, so still acceptable on mobile; the 16px iOS-zoom rule applies only to fields a touch user actually edits — keep website forms at 16px).
- Label above field, 13px 600 ink, 6px gap.
- Helper text below field, 12px 400 `#60646c`.
- Inline error: 12px 600 `#dc2626`, 4px gap below field. **Border** of the field turns `#dc2626` only when in error.
- Checkboxes / radios: 16px, 2px border `#dcdee0`, checked fill `#171717` with white glyph. Same hover (background `#fafafa`).
- Switch: 32×18, track `#dcdee0` off / `#171717` on, thumb `#fff`. Transition 200ms ease.

### 2.8 Sidebar nav

- 240px wide, dark `#171717` surface, **same Inter 14/500** for links.
- Row height **40px**, padding `8px 16px`, icon 20px + 12px gap + label.
- Section heading (above a group): 11px uppercase 600, color `#b0b4ba`, padding `16px 16px 8px`.
- Hover row: `rgba(255,255,255,0.08)`.
- Active row: `rgba(255,255,255,0.12)` + a `2px` left bar in `#ffffff` flush to the left edge.
- Collapsed (64px): icon only, label on `:hover` as a 12px tooltip pill (`#171717` bg, `#fff` text, `#dcdee0` border at 12% white).

### 2.9 Top bar (dashboard)

- 56px tall, `#ffffff`, `1px` bottom border `#dcdee0`.
- Left: page title (`22/600`) + optional breadcrumb above it (11px uppercase, `#999`).
- Right: search input (`.ds-text-input.is-sm`, 240px), notifications icon button, user avatar (32px circle, initials, `#171717` bg / `#fff` text).
- No shadow.

### 2.10 Charts

- Line / bar fill: `#171717` primary series, `#60646c` secondary, `#dcdee0` tertiary.
- Grid lines: `#f0f0f3` at 1px, dashed `4 4`.
- Axis labels: 11px `#999999`.
- Tooltip: white card, `1px #dcdee0` border, `12px` radius, soft shadow, 12px / 600 label + 13px Montserrat value.
- **No fills under lines, no gradient under-area shading.** If an area chart is needed, use a flat `#f0f0f3` fill.

### 2.11 Density toggle (optional but recommended)

A single toolbar control that switches `data-density="comfortable"` ↔ `data-density="compact"` on the dashboard root. Compact = row height 36px, card padding 16px, table cell padding `8/12`. Comfortable = the defaults above.

---

## 3. What stays identical across both surfaces

| Item | Value |
|------|-------|
| Font family (UI) | Inter |
| Font family (accent / numerics) | Montserrat |
| Icon family | Material Symbols Outlined |
| Primary button | `#000` → `#1a1a1a` hover, 8px radius, 14/500 |
| Secondary button | white, `#dcdee0` border, `#fafafa` hover |
| Border color | `#dcdee0` (everywhere) |
| Card radius | 12px |
| Button radius | 8px (sm: 6px) |
| Shadow | `0 4px 12px rgba(0,0,0,.04)` (the only one) |
| Focus ring | `2px solid #171717`, offset 3px |
| Link color | `#0d74ce` → `#476cff` hover |
| Disabled | `opacity: .55` |
| Transition | 150–220ms ease |
| Gradients | **None.** Solid fills only. |

## 4. What changes between Website and Dashboard

| Dimension | Website | Dashboard |
|-----------|---------|-----------|
| Background | `#ffffff` | `#fafafa` (so white cards stand out) |
| Layout | Centered, 1200px max | Fluid, sidebar + content |
| Sidebar | None (top nav) | `#171717` dark, 240px |
| Nav height | 64px | 56px |
| Largest type on screen | **64px** (hero H1) | **28px** (KPI big number) |
| Body text | 16px | 14px |
| Section padding | 96px | 24–32px |
| Card padding | 24px | 20px |
| Card grid gap | 24px | 16px |
| Default button | 40px tall | 40px tall (with `sm` 32px variant) |
| Density | Editorial / generous | Information-dense |
| Montserrat usage | Rare | Numbers in tables / IDs / timestamps |

---

## 5. Implementation notes

- All site-specific styles scope under `body.podcast-site`. Dashboard styles scope under `body.podcast-site[data-surface="dashboard"]` (or an equivalent root class) so the same tokens are picked up but density rules override.
- Tokens live in `app/globals.css` under `:root` and in `lib/design-tokens.ts`. **Always reference the variable, not the hex.**
- Use existing utility classes (`.ds-display-mega`, `.ds-title-md`, `.ds-btn-primary`, …) before reaching for ad-hoc Tailwind classes.
- Icons: `<span className="material-symbols-outlined">play_arrow</span>` — never an inline SVG when a Material Symbol exists.
- Respect `prefers-reduced-motion`: all transitions defined above must drop to `none` under it (already wired in `globals.css`).
