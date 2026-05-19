import fs from "fs";
import path from "path";
import { theme } from "../themes/theme.config";

const c = theme.colors;
const t = theme.typography;
const r = theme.radius;
const s = theme.shadow;

const css = `/* AUTO-GENERATED — do not edit directly. Change theme in themes/theme.config.ts */
:root {
  --color-primary:              ${c.primary};
  --color-primary-hover:        ${c.primaryHover};
  --color-primary-active:       ${c.primaryActive};
  --color-primary-disabled:     ${c.primaryDisabled};
  --color-on-primary:           ${c.onPrimary};
  --color-text-link:            ${c.textLink};
  --color-canvas:               ${c.canvas};
  --color-canvas-soft:          ${c.canvasSoft};
  --color-surface-card:         ${c.surfaceCard};
  --color-surface-soft:         ${c.surfaceSoft};
  --color-surface-strong:       ${c.surfaceStrong};
  --color-surface-dark:         ${c.surfaceDark};
  --color-surface-dark-elevated:${c.surfaceDarkElevated};
  --color-gradient-sky-light:   ${c.gradientSkyLight};
  --color-gradient-sky-mid:     ${c.gradientSkyMid};
  --color-hairline:             ${c.hairline};
  --color-hairline-soft:        ${c.hairlineSoft};
  --color-hairline-strong:      ${c.hairlineStrong};
  --color-ink:                  ${c.ink};
  --color-body:                 ${c.body};
  --color-muted:                ${c.muted};
  --color-muted-bg:             ${c.surfaceSoft};
  --color-muted-soft:           ${c.mutedSoft};
  --color-on-dark:              ${c.onDark};
  --color-on-dark-soft:         ${c.onDarkSoft};
  --color-warning:              ${c.warning};
  --color-success:              ${c.success};
  --color-error:                ${c.error};

  --font-sans:   ${t.fontSans};
  --font-mono:   ${t.fontMono};

  --radius-xs:   ${r.xs};
  --radius-sm:   ${r.sm};
  --radius-md:   ${r.md};
  --radius-lg:   ${r.lg};
  --radius-xl:   ${r.xl};
  --radius-pill: ${r.pill};

  --shadow-card: ${s.card};
}
`;

const outPath = path.join(__dirname, "../styles/generated-theme.css");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, css, "utf8");
console.log(`Theme "${theme.name}" written to styles/generated-theme.css`);
