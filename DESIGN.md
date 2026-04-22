# KOUPA — Design System
## Deep Space Editorial

> This file is the canonical design reference. Every UI decision must trace back to a rule here. When in doubt: add space, reduce density, trust the void.

---

## 1. Philosophy

KOUPA is not a dark-mode app. It is an atmospheric experience.

Think of it as the navigation deck of a deep-space vessel — vast, dark, purposeful. Every element earns its place on the screen. Nothing is decorative noise. Space itself is a design element.

**Core principles:**
- **Depth over flatness** — layers of surfaces, not a single plane
- **Focus over density** — one thing commands attention at a time
- **Intentional asymmetry** — not everything needs to be centered or symmetrical
- **Negative space is content** — emptiness communicates calm and control
- **The interface recedes; the content leads**

---

## 2. Surface Hierarchy & Color Tokens

There are five surface levels. They create perceived depth without shadows or borders. Never use a border where a background shift can do the work.

### Surface Stack (dark → light)

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#0F131F` | Page background — the void |
| `surface-container-lowest` | `#0A0E1A` | Inputs, recessed wells — deeper than the page |
| `surface-container-low` | `#171B28` | Section backgrounds, grouped areas |
| `surface-container` | `#1B1F2C` | Cards, list items, primary containers |
| `surface-container-highest` | `#313442` | Overlays, active states, tooltips |

### Brand & Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#D6BAFF` | Violet — interactive elements, active states, highlights |
| `primary-container` | `#7B5EA7` | Violet dark — button fills, badges, course color default |
| `secondary` | `#41E4C0` | Teal — success, progress, pulse indicators, input focus |
| `tertiary` | `#FFB955` | Amber — warnings, deadlines, time-sensitive indicators |
| `error` | `#FF6B6B` | Coral — errors, overdue items, destructive actions |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `on-surface` | `#DFE2F3` | Primary text — all body copy, titles |
| `on-surface-variant` | `rgba(223, 226, 243, 0.60)` | Secondary text — labels, captions, placeholders |
| `on-surface-disabled` | `rgba(223, 226, 243, 0.30)` | Disabled states only |
| `outline-variant` | `#4A454F` | Ghost borders only — never for layout separation |

**Rule: Never use pure white (`#FFFFFF`) anywhere. Always use `#DFE2F3` or its opacity variants.**

---

## 3. The No-Line Rule

**Never use solid lines or dividers to separate content areas.**

Lines are a symptom of insufficient spatial thinking. In KOUPA, separation is achieved through:

1. **Background shift** — adjacent sections use different surface levels (`surface-container-low` next to `surface`)
2. **Vertical spacing** — consistent gap between list items (12px), sections (24px), page sections (32px)
3. **Card containment** — content groups are card-wrapped, not line-divided

### The only exceptions where borders are allowed:
- Glassmorphism elements (modal overlays, bottom nav, FABs) — 1px at 20% opacity
- Active input focus ring — 1px `#41E4C0` with outer glow
- Active card left-edge accent — 2px left border in course/item color

Everything else: **no lines**.

---

## 4. The Glass & Gradient Rule

### Glassmorphism — applied to floating elements only

Modals, bottom navigation, floating action buttons, and sheet overlays use the glass treatment:

```css
background: rgba(15, 19, 31, 0.60);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(74, 69, 79, 0.20);
```

Do not apply glassmorphism to cards, list items, or page sections — only to elements that float above the surface layer.

### Gradients — applied to primary CTAs and brand accents only

Primary buttons always use the violet gradient:
```css
background: linear-gradient(135deg, #D6BAFF, #7B5EA7);
```

Course color chips and category badges may use a subtle radial fade:
```css
background: radial-gradient(ellipse at top left, {color}33, {color}11);
```

Ambient background glows (decorative, pointer-events: none):
```css
background: radial-gradient(ellipse at center, rgba(123, 94, 167, 0.15) 0%, transparent 70%);
```

**Rule: Gradients are never used for layout backgrounds, section fills, or cards. Only for interactive elements and ambient atmosphere.**

---

## 5. Typography

### Typefaces

| Role | Font | Weights Used |
|------|------|-------------|
| Headlines, Display, Wordmark | Space Grotesk | 400, 500, 600, 700 |
| Body, Labels, UI Text, Captions | Manrope | 400, 500, 600, 700 |

Space Grotesk is geometric and authoritative — it commands attention. Use it for anything that needs to feel structural or important.

Manrope is humanist and readable at small sizes in dark environments. Use it for everything else.

### Type Scale

| Level | Font | Size | Weight | Letter Spacing | Usage |
|-------|------|------|--------|---------------|-------|
| Display | Space Grotesk | 40–48px | 700 | -0.02em | Page heroes, login wordmark |
| H1 | Space Grotesk | 28–32px | 700 | -0.02em | Page titles |
| H2 | Space Grotesk | 22–24px | 600 | -0.01em | Section headers |
| H3 | Space Grotesk | 18–20px | 600 | 0 | Card titles, list headers |
| Body Large | Manrope | 16px | 400 | 0 | Primary body content |
| Body | Manrope | 14–15px | 400 | 0 | Secondary body, descriptions |
| Label | Manrope | 12px | 500 | 0.03em | UI labels, tags |
| Caption | Manrope | 11px | 400 | 0.05em | Timestamps, metadata |
| Overline | Manrope | 10–11px | 600 | 0.08em | Small caps category labels |

### Typography Rules
- Large titles: always `letter-spacing: -0.02em`
- Small caps / overline labels: always `letter-spacing: 0.05em` or more
- Never mix Space Grotesk and Manrope within the same text block
- Line height for body: 1.6. Line height for headlines: 1.1–1.2

---

## 6. Elevation & Depth

KOUPA uses three elevation levels. Elevation is expressed through surface color, not drop shadows.

### Level 0 — Ground (the void)
- Background: `#0F131F`
- No shadow, no border
- Used for: page canvas

### Level 1 — Raised (cards, containers)
- Background: `#1B1F2C`
- No shadow in resting state
- Used for: cards, list items, form groups

### Level 2 — Floating (overlays, FABs, bottom nav)
- Background: glassmorphism (`rgba(15,19,31,0.60)` + blur)
- Shadow: `0px 24px 48px rgba(0, 0, 0, 0.4)` — for FABs and modals only
- Used for: modals, drawers, bottom sheet, floating action buttons

### Shadow Rule
Shadows are only applied at Level 2 (floating elements). **Never add a shadow to a card or list item.** The surface color shift is sufficient.

---

## 7. Spacing & Layout

### Base Unit
All spacing is multiples of 4px.

### Page Padding
- Horizontal: `20px` on all screens (mobile-first)
- Top (below nav/header): `56px` or `14px` if using PageHeader component
- Bottom (above bottom nav): `96px` minimum to clear the nav

### Gap Scale
| Context | Gap |
|---------|-----|
| Within a card (between fields) | 12px |
| Between list items | 12px |
| Between cards in a list | 12px |
| Between sections on a page | 24–32px |
| Between the page title and first section | 24px |

### Border Radius Scale
| Element | Radius |
|---------|--------|
| Page cards, modals, sheets | 16px |
| Buttons (primary, secondary) | 12px |
| Input fields | 12px |
| Badges, tags, chips | 8px |
| Small indicators, dots | 50% (fully round) |
| Bottom nav | 0 (edge-to-edge) |

**Rule: Never use less than 8px radius on any visible surface. No sharp corners.**

---

## 8. Component Specifications

### 8.1 Buttons

#### Primary Button
The main action. Always gradient. Never flat.
```
background: linear-gradient(135deg, #D6BAFF, #7B5EA7)
color: #0F131F  (dark text on light gradient)
border-radius: 12px
padding: 14px 24px
font: Manrope 15px 600
min-height: 52px
active state: opacity 0.75
```

#### Secondary Button
Outlined. Used for secondary actions.
```
background: transparent
border: 1px solid rgba(74, 69, 79, 0.60)
color: #DFE2F3
border-radius: 12px
padding: 13px 24px
font: Manrope 15px 500
min-height: 52px
active state: background rgba(223,226,243,0.06)
```

#### Ghost Button / Text Button
No border, no background. For tertiary actions.
```
background: transparent
color: #D6BAFF
font: Manrope 14px 500
padding: 8px 12px
active state: opacity 0.65
```

#### Destructive Button
For deletes and irreversible actions.
```
background: transparent
border: 1px solid rgba(255, 107, 107, 0.40)
color: #FF6B6B
border-radius: 12px
padding: 13px 24px
```

### 8.2 Cards

Standard container for grouped content.
```
background: #1B1F2C
border-radius: 16px
padding: 16px
no internal dividers
no shadow (resting state)
```

Active / selected card state:
```
border-left: 2px solid {accent color}
background: #1B1F2C
(no full border, only left edge accent)
```

Interactive card (tappable):
```
active state: background #313442
transition: background 120ms ease
```

### 8.3 Input Fields

```
background: #0A0E1A  (surface-container-lowest — recessed)
border: 1px solid rgba(74, 69, 79, 0.40)
border-radius: 12px
padding: 14px 16px
color: #DFE2F3
font: Manrope 15px 400
placeholder color: rgba(223,226,243,0.30)
min-height: 52px

focus state:
  border-color: #41E4C0
  box-shadow: 0 0 0 3px rgba(65, 228, 192, 0.12)

error state:
  border-color: #FF6B6B
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.12)
```

Labels above inputs:
```
font: Manrope 12px 500
color: rgba(223,226,243,0.60)
letter-spacing: 0.03em
margin-bottom: 6px
```

### 8.4 Badges & Tags

Small, rounded, for status, priority, category labels.
```
border-radius: 8px
padding: 4px 10px
font: Manrope 11px 600
letter-spacing: 0.04em
text-transform: uppercase

Priority — high:   background rgba(255,107,107,0.15)  color #FF6B6B
Priority — medium: background rgba(255,185,85,0.15)   color #FFB955
Priority — low:    background rgba(65,228,192,0.15)   color #41E4C0
Status — done:     background rgba(65,228,192,0.10)   color rgba(65,228,192,0.70)
Course tag:        background rgba(123,94,167,0.20)   color #D6BAFF
```

### 8.5 Pulse Indicator

Used for active/live states — e.g. current class in session, today indicator.
```
Core dot:
  width: 8px
  height: 8px
  border-radius: 50%
  background: #41E4C0

Pulse ring (CSS animation):
  width: 8px
  height: 8px
  border-radius: 50%
  background: rgba(65, 228, 192, 0.10)
  animation: pulse 2s ease-in-out infinite

@keyframes pulse {
  0%   { transform: scale(1);   opacity: 0.8; }
  50%  { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(1);   opacity: 0; }
}
```

### 8.6 Progress Orbs

Circular progress for grades, readiness, completion rates. Never use flat progress bars.

```
Container:
  position: relative
  width: 56px (small) / 80px (medium) / 112px (large)
  height: same as width

SVG circle:
  stroke: rgba(65, 228, 192, 0.15)  (track)
  stroke-width: 3px (small) / 4px (medium)
  fill: none

Progress arc:
  stroke: url(#teal-gradient)
  stroke-linecap: round
  stroke-dasharray: {circumference}
  stroke-dashoffset: {circumference * (1 - percent)}
  transition: stroke-dashoffset 600ms ease

Gradient definition:
  #gradient stop 0%: #41E4C0
  #gradient stop 100%: #7B5EA7

Center text (optional):
  font: Space Grotesk 14px 600
  color: #DFE2F3
```

### 8.7 Modal / Bottom Sheet

```
Overlay backdrop:
  background: rgba(0, 0, 0, 0.60)
  backdrop-filter: blur(4px)

Sheet container:
  background: rgba(15, 19, 31, 0.92)
  backdrop-filter: blur(20px)
  border: 1px solid rgba(74, 69, 79, 0.20)
  border-radius: 24px 24px 0 0  (bottom sheet)
               24px            (centered modal)
  padding: 24px 20px
  box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.4)

Drag handle (bottom sheet):
  width: 36px
  height: 4px
  border-radius: 2px
  background: rgba(223,226,243,0.20)
  margin: 0 auto 16px
```

### 8.8 Bottom Navigation

```
height: 72px + env(safe-area-inset-bottom)
background: rgba(15, 19, 31, 0.60)
backdrop-filter: blur(20px)
border-top: 1px solid rgba(74, 69, 79, 0.20)
position: fixed, bottom: 0, left: 0, right: 0

Nav item:
  width: 56px
  height: 56px
  border-radius: 16px
  display: flex flex-col items-center justify-center gap-1

  icon: 22px, stroke 1.8px
  label: Manrope 10px, letter-spacing 0.03em

  inactive: color rgba(223,226,243,0.40)
  active:   color #D6BAFF, font-weight 600
```

### 8.9 Page Header

Sticky header present on most screens.
```
padding: 16px 20px 12px
background: transparent (content scrolls beneath)

Title: Space Grotesk 28px 700, color #DFE2F3, letter-spacing -0.02em
Subtitle / breadcrumb: Manrope 13px, color rgba(223,226,243,0.60)
Right action (icon button): 40px × 40px, background #1B1F2C, border-radius 12px
```

### 8.10 Empty State

When a list has no content.
```
Container:
  display: flex flex-col items-center justify-center
  padding: 48px 24px
  gap: 16px

Icon:
  48px × 48px
  color: rgba(223,226,243,0.20)

Title:
  Space Grotesk 18px 600, color rgba(223,226,243,0.60), text-align center

Subtitle:
  Manrope 14px, color rgba(223,226,243,0.40), text-align center

CTA (optional):
  Secondary button style
```

### 8.11 Countdown Badge

Used on exam cards and deadline homework. Shows time remaining.
```
background: rgba(255, 107, 107, 0.12)   (urgent < 3 days)
            rgba(255, 185, 85, 0.12)    (warning < 7 days)
            rgba(65, 228, 192, 0.10)    (safe > 7 days)

color:  #FF6B6B / #FFB955 / #41E4C0  (matching background tone)
border-radius: 8px
padding: 4px 10px
font: Manrope 11px 600
letter-spacing: 0.04em
```

### 8.12 Loading Spinner

```
SVG circle with rotating stroke-dashoffset animation
stroke: #D6BAFF
stroke-width: 2px
width/height: 24px (inline) / 40px (full-screen)
animation: spin 800ms linear infinite

Full-screen loading:
  position: fixed, inset 0
  display: flex items-center justify-center
  background: #0F131F
```

---

## 9. Motion & Animation

Keep motion subtle and purposeful. No bouncing, no overshoot. The interface is calm.

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button press (scale) | 100ms | ease-out |
| Card tap feedback | 120ms | ease |
| Modal appear | 250ms | cubic-bezier(0.32, 0.72, 0, 1) |
| Modal dismiss | 200ms | ease-in |
| Page transition | 180ms | ease |
| Pulse ring | 2000ms | ease-in-out infinite |
| Progress orb fill | 600ms | ease |
| Input focus ring | 150ms | ease |

**Rule: Never animate layout properties (width, height, top, left). Animate transform and opacity only.**

---

## 10. Icons

Use inline SVG only. No icon library. Keep icons to 20–24px with `stroke-width: 1.8`.

All icons must be:
- Outline style (not filled)
- `stroke="currentColor"` so they inherit text color
- `strokeLinecap="round"` and `strokeLinejoin="round"`
- Never use filled icons except for the active state of bottom nav (optional: slightly thicker stroke at 2.2px)

---

## 11. Do's and Don'ts

### DO
- Use background color shifts to separate sections
- Add generous padding — 20px horizontal, 24px+ between sections
- Use Space Grotesk for every title and header
- Round every corner — minimum 8px, cards at 16px
- Apply glassmorphism to modals, bottom nav, and FABs
- Use the violet gradient on every primary CTA
- Use teal (`#41E4C0`) for success states, active inputs, pulse dots
- Use amber (`#FFB955`) for time-sensitive warnings
- Use coral (`#FF6B6B`) for errors and overdue states
- Use circular progress — never flat bars
- Keep lists airy — 12px gaps, no dividers
- Use `rgba(223,226,243,0.60)` for muted/secondary text
- Use `letter-spacing: -0.02em` on all display/h1 text
- Make tappable targets at least 44px tall (iOS HIG)

### DON'T
- Don't use pure white (`#FFFFFF`) anywhere
- Don't use solid lines (`border-bottom: 1px solid`) to separate list items
- Don't use sharp corners (`border-radius: 0` or `4px`) on any visible surface
- Don't add shadows to cards or list items — only to floating elements
- Don't use flat (solid color) primary buttons
- Don't use flat progress bars — always circular
- Don't pack elements — crowded = broken
- Don't mix Space Grotesk and Manrope in the same text block
- Don't use glassmorphism on cards, list items, or section backgrounds
- Don't add decorative dividers between card content
- Don't use colored backgrounds for page sections — use surface color levels
- Don't animate layout properties — only transform and opacity
- Don't use font sizes below 10px
- Don't use opacity variants of brand colors for text — use the direct hex values

---

## 12. Quick Reference — Color Cheatsheet

```
PAGE BG:        #0F131F
CARD BG:        #1B1F2C
INPUT BG:       #0A0E1A
SECTION BG:     #171B28
OVERLAY BG:     #313442

TEXT PRIMARY:   #DFE2F3
TEXT MUTED:     rgba(223,226,243,0.60)
TEXT DISABLED:  rgba(223,226,243,0.30)

VIOLET:         #D6BAFF  /  #7B5EA7
TEAL:           #41E4C0
AMBER:          #FFB955
CORAL:          #FF6B6B

GRADIENT CTA:   linear-gradient(135deg, #D6BAFF, #7B5EA7)
GLASS BG:       rgba(15,19,31,0.60) + blur(20px)
GLASS BORDER:   rgba(74,69,79,0.20)
SHADOW:         0px 24px 48px rgba(0,0,0,0.4)
```
