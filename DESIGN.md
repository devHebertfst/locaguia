---
name: LocaGuia
description: Construction-equipment rental catalog with an assistant that turns a described job into a list of equipment.
colors:
  terra: "#241d17"
  terra-2: "#443f3b"
  concreto: "#eeeeee"
  laranja: "#f1933c"
  laranja-forte: "#e47f22"
  laranja-escuro: "#a9550a"
  laranja-queimado: "#c9680e"
  pessego: "#ffdebf"
  pessego-campo: "#fff4ea"
  pessego-quadro: "#fbe7d3"
  areia: "#c9c1b8"
  branco: "#ffffff"
  texto-no-terra: "#f6f1ec"
  texto-suave: "#575655"
  placeholder: "#6b655f"
  borda: "#dadad9"
  borda-campo: "#8c8782"
  destrutivo: "#c42b1c"
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
    backgroundColor: "{colors.terra}"
    textColor: "{colors.branco}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "40px"
  button-terra-hover:
    backgroundColor: "{colors.terra-2}"
  button-outline:
    textColor: "{colors.terra}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.concreto}"
  input:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.terra}"
    rounded: "{rounded.xl}"
    padding: "4px 14px"
    height: "44px"
  search-pill:
    backgroundColor: "{colors.branco}"
    rounded: "{rounded.full}"
    padding: "6px"
  search-pill-focus:
    backgroundColor: "{colors.pessego-campo}"
  chip-category:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.terra-2}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  chip-category-active:
    backgroundColor: "{colors.terra}"
    textColor: "{colors.branco}"
  card-equipment:
    backgroundColor: "{colors.branco}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  panel:
    backgroundColor: "{colors.branco}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.panel-lg}"
  soft-note:
    backgroundColor: "{colors.pessego}"
    textColor: "{colors.terra}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: LocaGuia

## Overview

**Creative North Star: "The Job-Site Mixer"**

LocaGuia is a construction site seen at dusk: a near-black earth-brown ground (terra) carries the header, page bands and footer, and against it a signal-orange works like site signage. Below the brown, the body opens into white and concrete-grey bands where the catalog, forms and answers live. The world is a translation of the Bolduzer rental reference into one small shop's voice: warm, physical, plain-spoken, and built for someone on a phone with dust on their hands.

Density is relaxed but not airy. Content sits in a 1280px column with generous section bands; cards and panels are white on concrete with hairline rings rather than heavy borders. Everything a customer can press is a pill, like a road sign or a hard-hat sticker. Soft peach fields mark where the customer types or where the assistant adds something extra. The signature is a procedural three.js concrete mixer in the home hero whose drum turns slowly, can be dragged, and speeds up when a job is sent in: the request goes "into the mixer" and comes out as equipment.

The build rejects the stock rental-shop hero (excavator photo, "Alugue já", service cards) and the small uppercase kicker above headings. Category is information about the equipment, so it sits under the name in sentence case or as a pill on the detail page.

**Key Characteristics:**
- Terra ground on top and bottom (header, page-title bands, hero, footer); white and concrete body between.
- Signal orange with dark terra text on every primary action; never white on orange.
- Cabin 500 display headings with tight tracking; Inter for everything read.
- Pills for every control, 15px cards, 20px panels and bands.
- Flat surfaces with hairline terra rings; shadow appears on hover or under the hero field.
- One 3D signature, decorative and optional, that yields to reduced motion and weak hardware.

## Colors

A warm earth-and-signage palette: one near-black brown, one signal orange with a darker sibling for small text, peach for soft fields, and neutral concrete.

### Primary
- **Signal Orange** (laranja): every primary button, the active-nav underline, the brand "Guia", the orange half of the hero headline, step numerals, the closing band background, and hover fill on secondary pills. Large and loud; always carries terra text.
- **Pressed Orange** (laranja-forte): hover state of the primary button only.
- **Rust Text Orange** (laranja-escuro): orange at text size on white. Category labels, inline text links, the radio/checkbox accent, bullet markers, input focus border, the selected gallery thumbnail ring. It exists because Signal Orange fails contrast as small text on white.
- **Burnt Orange** (laranja-queimado): the focus ring color (`--ring`), the primary-button glow tint, and the stripes painted on the 3D mixer drum. Details, never surfaces.

### Secondary
- **Terra** (terra): the ground. Header, footer, hero, page-title bands, the terra button, the active category chip, the customer's chat bubble, the arrow disc inside "Pedir orçamento". Also the body text color on light surfaces.
- **Graphite** (terra-2): terra-button hover, secondary text inside lists and descriptions, inactive chip text, the mixer chassis.

### Tertiary
- **Peach** (pessego): text selection on light grounds, soft notes (assistant materials, quote hints) at 70% opacity, the hero field's focus ring.
- **Peach Field** (pessego-campo): the hero question field background and the catalog search pill's focused background. Where the customer types into the world.
- **Peach Frame** (pessego-quadro): the no-photo placeholder behind the tool silhouette.

### Neutral
- **White** (branco): page body, cards, panels, inputs.
- **Concrete** (concreto): alternating section bands, the inner-page canvas behind panels, secondary buttons and the "Pedir orçamento" bar on cards, icon discs.
- **Sand** (areia): scrollbar thumb.
- **Text on Terra** (texto-no-terra): body text on terra ground; secondary copy on terra drops to white at 70-80% opacity.
- **Soft Text** (texto-suave): muted descriptions and helper text on white and concrete.
- **Placeholder** (placeholder): placeholder text in the peach hero field and the search pill.
- **Hairline** (borda): default border token; most separation is done with terra at 8-15% opacity as a ring.
- **Field Stroke** (borda-campo): input and textarea stroke.
- **Destructive** (destrutivo): errors, invalid fields, destructive buttons at 10% tint.

### Named Rules
**The Dark-On-Orange Rule.** Text on Signal Orange is always terra. The Bolduzer reference uses white; that fails contrast here, and the build translated it deliberately.

**The Two Oranges Rule.** Signal Orange is for fills and display-size type; anything orange at 14px on white uses Rust Text Orange.

**The Terra Ground Rule.** Terra is a ground, not a card. It runs edge to edge as header, hero, page-title band and footer; inside the body it appears only at control scale (terra button, active chip, chat bubble).

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
**The No-Kicker Rule.** Nothing small, uppercase and tracked sits above a heading. Category goes below the name in sentence case (Rust Text Orange, 14px 500) or in a pill beside the availability seal on the detail page.

**The Medium Display Rule.** Display and headline Cabin stay at weight 500; 600 is reserved for title-size type, and the logotype alone uses 700.

## Layout

A single centered column of 1280px (`max-w-7xl`) with 16px gutters, 24px from 640px up. Form-centric pages (assistant, quote) narrow to 768px (`max-w-3xl`); the sign-in card is 448px. Pages stack full-bleed bands that alternate terra, concrete and white, ending in the terra footer; vertical padding per band is 56-64px on mobile and 80-96px from 768px.

The home hero is a two-column grid from 768px (text 1.05fr, mixer 1fr) at nearly full viewport height (`min(46rem, 100svh - 4rem)`); on mobile the mixer drops below the text at 19-26rem tall and bleeds to the screen edge. Section intros pair a large heading with a short muted paragraph, side by side and bottom-aligned on desktop. Two-column content sections use a 1fr / 1.5fr split. The catalog grid goes 1, 2, 3 columns at 0, 640, 1024px; on mobile each card turns horizontal (112px square photo beside the text) to fit more equipment on screen. Category chips scroll horizontally on mobile with the scrollbar hidden.

Breakpoints are Tailwind's defaults (640 / 768 / 1024px).

## Elevation & Depth

Mostly flat. Surfaces separate by tone (white on concrete, concrete band after white band) and by a terra hairline ring at 8-15% opacity. Shadow is reserved for three cases: the primary button's orange glow, the equipment card on hover (it also lifts 2px), and the hero question field, which floats over the terra ground. The only true depth is the 3D mixer, lit with a warm hemisphere light, a key light and an orange rim light, sitting on a blurred Signal Orange glow at 20%.

### Shadow Vocabulary
- **Signal glow** (`box-shadow: 0 6px 16px -8px rgb(201 104 14 / 0.7)`): under every primary orange button.
- **Card rest** (`box-shadow: 0 1px 2px rgb(36 29 23 / 0.06)`): equipment card at rest.
- **Card lift** (`box-shadow: 0 18px 40px -20px rgb(36 29 23 / 0.35)`): equipment card on hover, with a -2px translate.
- **Field float** (`box-shadow: 0 24px 60px -24px rgb(0 0 0 / 0.7)`): the hero question field on terra.

### Named Rules
**The Ring-Not-Border Rule.** Containers on light grounds use a 1px terra ring at low opacity (8% at rest, up to 20-40% for open or hovered), not a grey border.

## Shapes

Three shape families. Every pressable control is a full pill: buttons, chips, the search bar, nav underline ends, availability seals, icon discs. Cards and inner tiles use 15px (`rounded-xl`), photos inside cards 12px. Panels, form fieldsets, the detail gallery and sign-in card use 20px (`rounded-2xl`). Chat bubbles are 20px with the corner nearest the speaker tightened to 9px. The hero field is a pill from 640px and a 22px rounded block when stacked on mobile.

The recurring silhouette is the mixer drum: it is the logo mark (a tilted orange drum over a ground line), the 3D signature, and the reason the hero behaves the way it does. The hero ground carries a faint 56px plumb grid (white at 7%, radially masked) like a site plan scratched on the floor.

## Components

### Buttons
Signage pills: loud, tactile, with a 1px press-down on active.
- **Shape:** full pill; heights 28 / 32 / 40 / 48px for xs / sm / default / lg.
- **Primary:** Signal Orange with terra text, 14px Inter 600, Signal glow; hover to Pressed Orange. Trailing arrow icons at 16px.
- **Terra:** terra with white text, hover graphite. The secondary strong action (search submit, "Perguntar o que serve no lugar" on unavailable equipment, sign-in with Google, the action on the orange closing band).
- **Outline:** transparent with a terra ring at 25%, hover full terra ring and concrete fill.
- **Secondary / Ghost / Link:** concrete fill; transparent with muted hover; Rust Text Orange text with underline on hover.
- **Focus:** 2px Burnt Orange outline offset 2px (Signal Orange on terra grounds). Transitions 200ms ease-out.

### Chips
- **Category chips:** 36px pills, white with a 12% terra ring and graphite text; hover ring to 40%. Active is solid terra with white text.
- **Example chips (on terra):** 36px pills, white ring at 20%, white text at 80%; hover ring Signal Orange.
- **Availability seal:** available is a 6px green dot with green 12px text, no fill; unavailable is a concrete pill with a grey dot and muted text ("Indisponível no momento").

### Cards / Containers
- **Equipment card:** white, 15px, 10-12px padding, Card rest shadow plus 8% terra ring; on hover it lifts with Card lift, the photo scales 1.03 over 500ms, and the name draws a 2px underline left to right. Name in Cabin, category below in Rust Text Orange, two-line description, availability seal, then a concrete "Pedir orçamento" pill bar with a terra arrow disc that fills Signal Orange on hover.
- **Panels:** white, 20px, 20-28px padding, 8% terra ring, on concrete. Used for quote fieldsets, the detail action box, sign-in, success state.
- **Soft notes:** Peach at 70%, 15px, 16-20px padding, for assistant-suggested materials and quote hints; bullets in Rust Text Orange.
- **No-photo placeholder:** Peach Frame with a centered tool silhouette in Rust Text Orange at 70%, so an empty catalog never looks broken.
- **FAQ:** `details` rows in white 15px tiles; a concrete 32px disc with a plus that rotates 45 degrees and fills orange when open.

### Inputs / Fields
- **Style:** white, 1px Field Stroke, 15px radius, 44px tall, 14px horizontal padding, 16px text (14px from 768px).
- **Focus:** border to Rust Text Orange plus a 3px Signal Orange ring at 35%.
- **Error:** destructive border and a 3px destructive ring at 20%; message in destructive 14px below.
- **Hero question field:** Peach Field pill holding a borderless input and the large primary button; Placeholder text color; 4px Peach ring on focus; Field float shadow.
- **Search pill:** white pill with a 15% terra ring, leading search icon, terra submit button inside; on focus the pill turns Peach Field with a 2px Rust Text Orange ring.
- **Chat composer:** auto-growing textarea at 26px radius, sticky to the bottom on concrete.

### Navigation
- **Header:** 64px terra bar with a white 10% bottom hairline; logo left (symbol only below 380px), links right. Links are Inter 500, white at 75%, hover white; the current page is white with a 2px Signal Orange underline that scales in from the left over 300ms. "Orçamento" is always a small primary pill at the end.
- **Footer:** terra, logo and a one-line plain-language promise left, links right in white 80% with Signal Orange hover; the staff link sits quieter at 50%.
- **Page-title band:** inner pages open with a terra band continuing the header, holding the page H1 and lede; the detail page uses a slim terra band with a back link instead.

### Chat
Customer messages are terra bubbles with white text aligned right; assistant replies are white bubbles with an 8% terra ring aligned left; the loading line spins a Rust Text Orange loader (static under reduced motion). Recommended equipment renders as white tiles with name, category and the reason, ending in an arrow disc.

### Mixer 3D (signature)
A procedural concrete mixer built in three.js: orange drum with Burnt Orange and terra stripes and the LOCAGUIA wordmark, graphite chassis, steel and tyre details. The drum turns slowly, can be dragged (pan-y stays scrollable on touch), speeds up when the hero form is sent (the navigation waits 450ms, or 0 under reduced motion), and responds to scroll. The canvas fades in over 700ms.
- three is imported only after mount; with no WebGL the box stays empty and the page is unaffected (it is `aria-hidden`).
- `prefers-reduced-motion` or a software renderer (SwiftShader, llvmpipe, "basic render") renders a static frame.
- Idle rotation is capped at 30fps; dragging renders at full rate. Rendering pauses off-screen and in hidden tabs; pixel ratio caps at 1.75 with the low-power GPU preference.

## Do's and Don'ts

### Do:
- **Do** put terra text on every Signal Orange fill (The Dark-On-Orange Rule).
- **Do** use Rust Text Orange (laranja-escuro) for any orange text at body or label size on white or concrete.
- **Do** open every inner page with a terra page-title band continuing the header, and close every page with the terra footer.
- **Do** make every pressable control a full pill; keep cards at 15px and panels at 20px.
- **Do** set category under the equipment name in sentence case, Rust Text Orange, 14px 500.
- **Do** separate light containers with a terra ring at 8-15% opacity rather than a grey border.
- **Do** use Peach Field or Peach for places where the customer types or the assistant adds context, with Placeholder (#6b655f) as placeholder text on peach.
- **Do** keep any motion decorative and stoppable: honor `prefers-reduced-motion`, and keep heavy scenes lazy-loaded, paused off-screen and capped at 30fps when idle.

### Don't:
- **Don't** put white text on Signal Orange.
- **Don't** add a small uppercase kicker or eyebrow above headings.
- **Don't** set display or headline Cabin heavier than 500.
- **Don't** use terra as a card color inside light sections; it is a ground or a control, never a container.
- **Don't** open with the stock rental hero (equipment photo, "Alugue já", service-card row).
- **Don't** add a second 3D or animated signature; the mixer is the one.
