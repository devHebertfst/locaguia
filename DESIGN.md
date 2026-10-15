---
name: LocaGuia
description: Construction-equipment rental catalog with an assistant that turns a described job into a list of equipment.
colors:
  terra: "#241d17"
  terra-2: "#443f3b"
  concreto: "#2c241e"
  laranja: "#f1933c"
  laranja-forte: "#e47f22"
  laranja-escuro: "#a9550a"
  laranja-queimado: "#c9680e"
  pessego: "#ffdebf"
  pessego-campo: "#fff4ea"
  pessego-quadro: "#fbe7d3"
  areia: "#c9c1b8"
  branco: "#ffffff"
  creme: "#f6f1ec"
  cartao: "#352c25"
  muted: "#3d332b"
  acento: "#4a3422"
  texto-no-terra: "#f6f1ec"
  texto-suave: "#bdb3a9"
  placeholder: "#6b655f"
  borda: "#4a4038"
  borda-campo: "#786e65"
  destrutivo: "#f2705f"
typography:
  display:
    fontFamily: "Cabin, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 6.2vw, 4.6rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Cabin, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.25rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Cabin, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  lede:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: "6px"
  md: "9px"
  lg: "12px"
  xl: "15px"
  2xl: "20px"
  3xl: "26px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  card: "12px"
  panel: "20px"
  panel-lg: "28px"
  section: "64px"
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.laranja}"
    textColor: "{colors.terra}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.laranja-forte}"
  button-primary-lg:
    backgroundColor: "{colors.laranja}"
    textColor: "{colors.terra}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-terra:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.terra}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "40px"
  button-terra-hover:
    backgroundColor: "{colors.areia}"
  button-outline:
    textColor: "{colors.creme}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.concreto}"
  input:
    backgroundColor: "{colors.terra}"
    textColor: "{colors.creme}"
    rounded: "{rounded.xl}"
    padding: "4px 14px"
    height: "44px"
  search-pill:
    backgroundColor: "{colors.cartao}"
    rounded: "{rounded.full}"
    padding: "6px"
  search-pill-focus:
    backgroundColor: "{colors.acento}"
  chip-category:
    backgroundColor: "{colors.cartao}"
    textColor: "{colors.texto-suave}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  chip-category-active:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.terra}"
  card-equipment:
    backgroundColor: "{colors.cartao}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  panel:
    backgroundColor: "{colors.cartao}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.panel-lg}"
  soft-note:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.creme}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: LocaGuia

## Overview

**Creative North Star: "The Job-Site Mixer"**

LocaGuia is a construction site seen at dusk: a near-black earth-brown ground (terra) carries every page, from header to footer, and against it a signal-orange works like site signage. The brown runs through the whole app: the body alternates terra and a slightly lighter terra (concrete) band, and the catalog, forms and answers sit on warm dark cards one step lighter. The world is a translation of the Bolduzer rental reference into one small shop's voice: warm, physical, plain-spoken, and built for someone on a phone with dust on their hands.

Density is relaxed but not airy. Content sits in a 1280px column with generous section bands; cards and panels are a lighter brown on the terra ground with hairline cream rings rather than heavy borders. Everything a customer can press is a pill, like a road sign or a hard-hat sticker. Orange-tinted fields (acento) mark where the customer types or where the assistant adds something extra; the hero question field stays a light peach pill. The signature is a procedural three.js concrete mixer in the home hero whose drum turns slowly, can be dragged, and speeds up when a job is sent in: the request goes "into the mixer" and comes out as equipment.

The build rejects the stock rental-shop hero (excavator photo, "Alugue já", service cards) and the small uppercase kicker above headings. Category is information about the equipment, so it sits under the name in sentence case or as a pill on the detail page.

**Key Characteristics:**
- Terra ground everywhere: header, hero, page bands, body and footer; dark cards one step lighter carry the content.
- Signal orange with dark terra text on every primary action; never white on orange.
- Cabin 500 display headings with tight tracking; Inter for everything read.
- Pills for every control, 15px cards, 20px panels and bands.
- Flat surfaces with hairline cream rings; shadow appears on hover or under the hero field.
- One 3D signature, decorative and optional, that yields to reduced motion and weak hardware.

## Colors

A warm earth-and-signage palette on a dark ground: one near-black brown that carries the whole app, lighter browns for bands and cards, cream for text, one signal orange, and peach kept for the hero field and selection.

### Primary
- **Signal Orange** (laranja): every primary button, the active-nav underline, the brand "Guia", the orange half of the hero headline, step numerals, the closing band background, hover fill on secondary pills, and all orange text on the dark ground (category labels, inline links, bullets, input focus border, the radio/checkbox accent). As a fill it always carries terra text.
- **Pressed Orange** (laranja-forte): hover state of the primary button only.
- **Rust Text Orange** (laranja-escuro): kept in the palette for orange on light surfaces only (the hero peach field). On the dark ground Signal Orange already has enough contrast, so the UI no longer uses it for text.
- **Burnt Orange** (laranja-queimado): the primary-button glow tint and the stripes painted on the 3D mixer drum. Details, never surfaces. The focus ring (`--ring`) is now Signal Orange.

### Secondary
- **Terra** (terra): the ground of the whole app (`--background`), and the text color on orange, peach and cream fills. The terra button survives only on the orange closing band.
- **Graphite** (terra-2): terra-button hover on the closing band and the mixer chassis.

### Tertiary
- **Peach** (pessego): text selection, the "em atendimento" status seal, the hero field's focus ring.
- **Peach Field** (pessego-campo): the hero question field background, the one light field floating on the dark hero.
- **Accent** (acento, `--accent`): orange-tinted brown for soft notes (assistant materials, quote hints), the customer's chat bubble, the no-photo placeholder and the focused search pill. "New" rows in the admin use Signal Orange at 7%.

### Neutral
- **Cream** (creme): body text (`--foreground`), the strong secondary button, the active category chip, the active admin nav item, and the arrow disc on cards. Text on cream is terra.
- **Card** (cartao, `--card`): cards, panels, the assistant's chat bubble, inactive chips.
- **Concrete** (concreto): a slightly lighter terra for alternating section bands, icon discs and the "Pedir orçamento" bar on cards.
- **Muted** (muted, `--muted`/`--secondary`): secondary buttons, hover fills, the "Desativado" seal.
- **White** (branco): only at low opacity on terra (grids, translucent tiles in the reviews band).
- **Sand** (areia): scrollbar thumb.
- **Text on Terra** (texto-no-terra): body text on terra ground; secondary copy on terra drops to white at 70-80% opacity.
- **Soft Text** (texto-suave): muted descriptions, helper text and inactive chip text.
- **Placeholder** (placeholder): placeholder text in the peach hero field.
- **Hairline** (borda): default border token; most separation is done with cream (`foreground`) at 8-15% opacity as a ring.
- **Field Stroke** (borda-campo): input and textarea stroke; fields sit on terra, a step darker than the panel around them.
- **Destructive** (destrutivo): errors, invalid fields, destructive buttons at 10% tint.

### Named Rules
**The Dark-On-Orange Rule.** Text on Signal Orange is always terra. The Bolduzer reference uses white; that fails contrast here, and the build translated it deliberately.

**The Two Oranges Rule.** Signal Orange is for fills and for orange text on the dark ground; anything orange at text size on a light surface (the peach hero field) uses Rust Text Orange.

**The Terra Ground Rule.** Terra is the ground of every page, edge to edge. Content lifts off it with lighter browns (concrete bands, cards), never with white surfaces; strong controls on terra are cream with terra text.

## Typography

**Display Font:** Cabin (via next/font, `--font-cabin`, with the system sans fallback)
**Body Font:** Inter (via next/font, `--font-inter`, with the system sans fallback)

**Character:** Cabin is a humanist sans with a slightly workmanlike warmth; at weight 500 and tight tracking it reads as confident signage without shouting. Inter carries all running text, labels and controls in a neutral, legible voice.

### Hierarchy
- **Display** (Cabin 500, clamp 2.4rem to 4.6rem, line-height 1.02, -0.025em): the home hero headline only, white with the second line in Signal Orange. Page-title bands use the same voice one step down (clamp 2rem to 3.5rem, line-height 1.04).
- **Headline** (Cabin 500, clamp 2rem to 3.25rem, line-height 1.05, -0.02em): section headings on the home, the equipment name on the detail page, the closing band (clamp 1.9rem to 3rem).
- **Title** (Cabin 600, 1.125-1.5rem): card names, FAQ questions, form fieldset legends (1.5rem), step titles, recommended-item names. Step numerals are Cabin 600 at 3-3.75rem in Signal Orange.
- **Body** (Inter 400, 16px, line-height 1.5): all running text; descriptions cap at 52-62ch.
- **Lede** (Inter 400, 18px, relaxed 1.625): hero and page-title subtitles, capped at 46-58ch, white at 75% on terra.
- **Label** (Inter 500-600, 14px): buttons (600), nav, chips, field labels, category text. Sentence case always.

### Named Rules
**The No-Kicker Rule.** Nothing small, uppercase and tracked sits above a heading. Category goes below the name in sentence case (Signal Orange, 14px 500) or in a pill beside the availability seal on the detail page.

**The Medium Display Rule.** Display and headline Cabin stay at weight 500; 600 is reserved for title-size type, and the logotype alone uses 700.

## Layout

A single centered column of 1280px (`max-w-7xl`) with 16px gutters, 24px from 640px up. Form-centric pages (assistant, quote) narrow to 768px (`max-w-3xl`); the sign-in card is 448px. Pages stack full-bleed bands that alternate terra and concrete (lighter terra), ending in the terra footer; vertical padding per band is 56-64px on mobile and 80-96px from 768px.

The home hero is a two-column grid from 768px (text 1.05fr, mixer 1fr) at nearly full viewport height (`min(46rem, 100svh - 4rem)`); on mobile the mixer drops below the text at 19-26rem tall and bleeds to the screen edge. Section intros pair a large heading with a short muted paragraph, side by side and bottom-aligned on desktop. Two-column content sections use a 1fr / 1.5fr split. The catalog grid goes 1, 2, 3 columns at 0, 640, 1024px; on mobile each card turns horizontal (112px square photo beside the text) to fit more equipment on screen. Category chips scroll horizontally on mobile with the scrollbar hidden.

Breakpoints are Tailwind's defaults (640 / 768 / 1024px).

## Elevation & Depth

Mostly flat. Surfaces separate by tone (card on terra, concrete band after terra band) and by a cream hairline ring at 8-15% opacity. Shadow is reserved for three cases: the primary button's orange glow, the equipment card on hover (it also lifts 2px), and the hero question field, which floats over the terra ground. The only true depth is the 3D mixer, lit with a warm hemisphere light, a key light and an orange rim light, sitting on a blurred Signal Orange glow at 20%.

### Shadow Vocabulary
- **Signal glow** (`box-shadow: 0 6px 16px -8px rgb(201 104 14 / 0.7)`): under every primary orange button.
- **Card rest** (`box-shadow: 0 1px 2px rgb(36 29 23 / 0.06)`): equipment card at rest.
- **Card lift** (`box-shadow: 0 18px 40px -20px rgb(36 29 23 / 0.35)`): equipment card on hover, with a -2px translate.
- **Field float** (`box-shadow: 0 24px 60px -24px rgb(0 0 0 / 0.7)`): the hero question field on terra.

### Named Rules
**The Ring-Not-Border Rule.** Containers use a 1px cream ring at low opacity (8% at rest, up to 20-40% for open or hovered), not a grey border.

## Shapes

Three shape families. Every pressable control is a full pill: buttons, chips, the search bar, nav underline ends, availability seals, icon discs. Cards and inner tiles use 15px (`rounded-xl`), photos inside cards 12px. Panels, form fieldsets, the detail gallery and sign-in card use 20px (`rounded-2xl`). Chat bubbles are 20px with the corner nearest the speaker tightened to 9px. The hero field is a pill from 640px and a 22px rounded block when stacked on mobile.

The recurring silhouette is the mixer drum: it is the logo mark (a tilted orange drum over a ground line), the 3D signature, and the reason the hero behaves the way it does. The hero ground carries a faint 56px plumb grid (white at 7%, radially masked) like a site plan scratched on the floor.

## Components

### Buttons
Signage pills: loud, tactile, with a 1px press-down on active.
- **Shape:** full pill; heights 28 / 32 / 40 / 48px for xs / sm / default / lg.
- **Primary:** Signal Orange with terra text, 14px Inter 600, Signal glow; hover to Pressed Orange. Trailing arrow icons at 16px.
- **Terra** (variant name kept): cream with terra text, hover sand. The secondary strong action (search submit, "Perguntar o que serve no lugar" on unavailable equipment, sign-in with Google). On the orange closing band it is overridden back to terra with cream text.
- **Outline:** transparent with a cream ring at 25%, hover full cream ring and concrete fill. On the orange closing band it uses terra ring and text.
- **Secondary / Ghost / Link:** muted fill; transparent with muted hover; Signal Orange text with underline on hover.
- **Focus:** 2px Signal Orange outline offset 2px. Transitions 200ms ease-out.

### Chips
- **Category chips:** 36px pills, card fill with a 12% cream ring and soft text; hover ring to 40%. Active is solid cream with terra text.
- **Example chips (on terra):** 36px pills, white ring at 20%, white text at 80%; hover ring Signal Orange.
- **Availability seal:** available is a 6px green dot with light green (#7ed99a) 12px text, no fill; unavailable is a concrete pill with a grey dot and muted text ("Indisponível no momento").

### Cards / Containers
- **Equipment card:** card fill, 15px, 10-12px padding, Card rest shadow plus 8% cream ring; on hover it lifts with Card lift, the photo scales 1.03 over 500ms, and the name draws a 2px underline left to right. Name in Cabin, category below in Signal Orange, two-line description, availability seal, then a concrete "Pedir orçamento" pill bar with a cream arrow disc that fills Signal Orange on hover.
- **Panels:** card fill, 20px, 20-28px padding, 8% cream ring, on terra or concrete. Used for quote fieldsets, the detail action box, sign-in, success state.
- **Soft notes:** Accent, 15px, 16-20px padding, for assistant-suggested materials and quote hints; bullets in Signal Orange.
- **No-photo placeholder:** Accent with a centered tool silhouette in Signal Orange at 70%, so an empty catalog never looks broken.
- **FAQ:** `details` rows in concrete 15px tiles that turn card-colored when open; a 32px card disc with a plus that rotates 45 degrees and fills orange when open.

### Inputs / Fields
- **Style:** terra fill, cream text, 1px Field Stroke, 15px radius, 44px tall, 14px horizontal padding, 16px text (14px from 768px).
- **Focus:** border to Signal Orange plus a 3px Signal Orange ring at 35%.
- **Error:** destructive border and a 3px destructive ring at 20%; message in destructive 14px below.
- **Hero question field:** Peach Field pill holding a borderless input and the large primary button; Placeholder text color; 4px Peach ring on focus; Field float shadow.
- **Search pill:** card pill with a 15% cream ring, leading search icon, cream submit button inside; on focus the pill turns Accent with a 2px Signal Orange ring.
- **Chat composer:** auto-growing textarea at 26px radius, sticky to the bottom on concrete.

### Navigation
- **Header:** 64px terra bar with a white 10% bottom hairline; logo left (symbol only below 380px), links right. Links are Inter 500, white at 75%, hover white; the current page is white with a 2px Signal Orange underline that scales in from the left over 300ms. "Orçamento" is always a small primary pill at the end.
- **Footer:** terra, logo and a one-line plain-language promise left, links right in white 80% with Signal Orange hover; the staff link sits quieter at 50%.
- **Page-title band:** inner pages open with a terra band continuing the header, holding the page H1 and lede; the detail page uses a slim terra band with a back link instead.

### Chat
Customer messages are Accent bubbles with cream text aligned right; assistant replies are card bubbles with an 8% cream ring aligned left; the loading line spins a Signal Orange loader (static under reduced motion). Recommended equipment renders as card tiles with name, category and the reason, ending in an arrow disc.

### Mixer 3D (signature)
A procedural concrete mixer built in three.js: orange drum with Burnt Orange and terra stripes and the LOCAGUIA wordmark, graphite chassis, steel and tyre details. The drum turns slowly, can be dragged (pan-y stays scrollable on touch), speeds up when the hero form is sent (the navigation waits 450ms, or 0 under reduced motion), and responds to scroll. The canvas fades in over 700ms.
- three is imported only after mount; with no WebGL the box stays empty and the page is unaffected (it is `aria-hidden`).
- `prefers-reduced-motion` or a software renderer (SwiftShader, llvmpipe, "basic render") renders a static frame.
- Idle rotation is capped at 30fps; dragging renders at full rate. Rendering pauses off-screen and in hidden tabs; pixel ratio caps at 1.75 with the low-power GPU preference.

## Do's and Don'ts

### Do:
- **Do** put terra text on every Signal Orange fill (The Dark-On-Orange Rule).
- **Do** use Signal Orange for orange text on the dark ground; keep Rust Text Orange for the rare light surface.
- **Do** open every inner page with a terra page-title band continuing the header, and close every page with the terra footer.
- **Do** make every pressable control a full pill; keep cards at 15px and panels at 20px.
- **Do** set category under the equipment name in sentence case, Signal Orange, 14px 500.
- **Do** separate containers with a cream ring at 8-15% opacity rather than a grey border.
- **Do** use Accent for places where the assistant adds context; the hero question field is the one Peach Field, with Placeholder (#6b655f) as its placeholder text.
- **Do** keep any motion decorative and stoppable: honor `prefers-reduced-motion`, and keep heavy scenes lazy-loaded, paused off-screen and capped at 30fps when idle.

### Don't:
- **Don't** put white text on Signal Orange.
- **Don't** add a small uppercase kicker or eyebrow above headings.
- **Don't** set display or headline Cabin heavier than 500.
- **Don't** reintroduce white or light-grey surfaces in the body; lift content with lighter browns instead.
- **Don't** open with the stock rental hero (equipment photo, "Alugue já", service-card row).
- **Don't** add a second 3D or animated signature; the mixer is the one.
