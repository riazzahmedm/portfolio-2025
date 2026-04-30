# Immersive Portfolio — Design Spec
**Date:** 2026-04-23  
**Owner:** Riaz Ahmed  
**Stack:** Next.js · Tailwind CSS · Framer Motion

---

## 1. Aesthetic Direction

**Theme:** Dark, cinematic, immersive — developer-coded, not designer-templated.

| Token | Value |
|---|---|
| Background | `#050505` near-black |
| Dot grid | `rgba(255,255,255,0.15)` 1px dots, 28px spacing |
| Primary text | `#ffffff` |
| Accent | `#e02020` red |
| Muted text | `rgba(255,255,255,0.35)` |
| Display font | Bebas Neue (headings, name, section numbers) |
| Body/UI font | Space Mono (all body copy, labels, terminal text) |

**Signature details:**
- Dot grid fades at edges via radial vignette (`radial-gradient` overlay)
- Red glow orb alternates position per section (top-right → bottom-left → top-left…) for cinematic depth variation
- Large ghost watermark section number (`02`, `03`…) in background at `rgba(255,255,255,0.02)`
- Section headings always pair a solid white word with an outlined/ghost word (e.g. `WHO` solid + `I AM` outlined)

---

## 2. Scroll Architecture

**Pattern:** CSS `scroll-snap-type: y mandatory` on a full-viewport container. Each section is `height: 100vh` with `scroll-snap-align: start`.

**Navigation:**
- Vertical dot rail on the right edge — 8 dots, active dot is red with glow
- Section counter bottom-right: `01 / 08` → updates per section
- Keyboard: `↑` / `↓` arrow keys advance sections
- Top nav links jump directly to any section via smooth scroll

**Entry animations (Framer Motion `whileInView`):**
- Each section triggers on snap into view
- Default: content fades up (`y: 40 → 0`, `opacity: 0 → 1`, `duration: 0.6s`, `ease: easeOut`)
- Stagger children by `0.08s` delay
- Heading characters animate letter by letter on the hero

---

## 3. Global Chrome

### Top Navigation
- Logo: `R.A` — Bebas Neue, red dot as punctuation (`R·A`)
- Links: Home · About · Skills · Experience · Work · Services · Testimonials · Contact
- Right: green pulse dot + "Available for work" status
- Transparent background, `border-bottom: 1px solid rgba(255,255,255,0.06)`
- Fixed, always visible above sections

### Marquee Ticker (below nav on hero)
Scrolling strip of technical copy:
```
npm run portfolio  ●  git push origin main  ●  tokens consumed: ∞  ●  ctrl+z: 0 regrets  ●  yarn build --production  ●  merge conflicts resolved: 300+  ●  uptime: 5 years  ●  404: bugs not found  ●  npm run hire-me
```

### Side Dot Navigator
8 dots, right edge, vertically centered. Active = red + glow. Click to jump section.

### Section Footer Bar
Every section: animated red scan line + "Scroll to explore" left, `01 / 08` counter right (number updates via JS as active section changes).

---

## 4. Sections

### 01 — Hero
**Layout:** Full viewport, centered-left content, stats column bottom-right.

**Content:**
- Eyebrow: `Senior Software Engineer` (red, with red line prefix)
- Name: `RIAZ` (solid white, Bebas Neue 6rem) + `AHMED` (outlined/ghost)
- Tagline: "Building immersive digital products with React, Next.js & React Native. 5+ years · 40+ projects · Chennai, India."
- CTAs: `[View Work]` (white filled) + `Download CV →` (text link, red arrow)
- Stats block (bottom-right): `projects.length: 40+` · `experience.years: 5+` · `conflicts.resolved: 300+` · `tokens.consumed: ∞` · `ctrl_z.count: 0`
- Red glow orb: top-right

**Animation:** Name letters animate in one by one. Stats count up on entry.

---

### 02 — About
**Layout:** Split 50/50 — bio left, career timeline right. Vertical divider line.

**Left:**
- Section tag: `02 ——— About Me`
- Heading: `WHO` (solid) + `I AM` (outlined)
- Bio paragraph with bolded key terms (Chennai, web and mobile, UI/UX in Figma)
- Trait tags: `React / Next.js` · `React Native` · `.NET Core` · `TypeScript` · `Figma` · `Azure` (red border on tech stack tags)

**Right:**
- Label: `Career Path`
- Timeline: 4 entries with year, role, company. Current role has red glowing dot. **User to supply actual company names and years.**
- Meta bar: `◈ Chennai, India` · `◈ LinkedIn` · `◈ Dribbble`

**Watermark:** Ghost `02` bottom-right. Red orb: bottom-left.

---

### 03 — Skills
**Layout:** Full width code editor aesthetic.

**Content:**
- Heading: `SKILL` (solid) + `SET` (outlined)
- Skills rendered as syntax-highlighted code declarations:
  ```js
  const react        = "5+ years"   // battle-tested
  const nextjs       = "expert"     // SSR, ISR, App Router
  const reactNative  = "5+ years"   // iOS + Android
  const typescript   = "strict mode" // always
  const figma        = "3+ years"   // design → code
  const dotnet       = "C# / Core"  // full stack
  const tokens       = Infinity     // claude-powered
  const ctrlZ        = "never needed" // git revert
  ```
- Keywords red, variable names white, strings amber, comments muted, numbers blue
- Three category columns organise the code block: Web Dev (left) · Mobile (centre) · Design & Tools (right)
- Each column is its own syntax-highlighted code block
- Below the code blocks: progress bars styled as terminal fill: `████████░░ 80%`

**Animation:** Lines type in one by one, cursor blink at end.

---

### 04 — Experience
**Layout:** Split — timeline left, detail panel right.

**Content:**
- Heading: `EXP` (solid) + `ERIENCE` (outlined)
- Left: Vertical timeline — year nodes, role title, company, red dot for current
- Right: Expandable detail panel — clicking a role shows bullet points of achievements
- Technical tags per role: `React` · `Azure` · `TypeScript` etc.
- Easter egg footer: `git log --author="Riaz" --oneline | wc -l`

**Watermark:** Ghost `04`. Red orb: top-left.

---

### 05 — Projects
**Layout:** 2×N card grid with featured project taking full width at top.

**Content:**
- Heading: `PRO` (solid) + `JECTS` (outlined)
- Featured project card (full width, top): **Oodle Finance** by default — large image/preview, description, tech stack tags, App Store + repo links. User may swap.
- Grid cards (2-column below): ACS Life · P&O Ferries · MidiUnderground · Onboarding Hub · IFF Research · Murge Eat
- Each card: project name, one-line description, tech tags, `npm run [project-name]` hover label, links
- Hover state: card lifts, red border appears, overlay shows tech stack

**Animation:** Cards stagger in. Hover triggers red glow border + lift.

---

### 06 — Services
**Layout:** 3-column grid of service blocks.

**Content:**
- Heading: `SER` (solid) + `VICES` (outlined)
- Services: Web Development · Mobile App Development · UI/UX Design
- Each block: icon (ASCII/unicode), title, description, tech list
- Styled like API endpoint cards:
  ```
  POST /web-development
  GET  /mobile-apps
  PUT  /ui-ux-design
  ```
- Bottom CTA: `ping riaz --service=custom` → Contact

**Watermark:** Ghost `06`. Red orb: bottom-right.

---

### 07 — Testimonials
**Layout:** Full-width carousel with one testimonial at a time.

**Content:**
- Heading: `FEED` (solid) + `BACK` (outlined)
- Quote displayed large, Space Mono italic
- Author name + role below
- Navigation: `[prev]` `[next]` keyboard + click
- Corner label: `// peer review`
- Subtext: `verified by humans, not tokens`

**Animation:** Slide transition between testimonials with fade.

---

### 08 — Contact
**Layout:** Split — terminal block left, form right.

**Left — Terminal:**
```
❯ whoami
  Riaz Ahmed — Senior Software Engineer

❯ ping riaz --hire
  Connecting to riazzahmedm@gmail.com...
  ✓ Available for new opportunities

❯ cat contact.json
  { "email": "riazzahmedm@gmail.com",
    "location": "Chennai, India",
    "status": "open to work" }

❯ _
```

**Right — Form:**
- Fields: Name · Email · Message
- Labels styled as variable declarations: `const name =`
- Submit button: `git commit -m "Let's work together"`
- Success state: `✓ Message delivered. Response ETA: 24h`

**Watermark:** Ghost `08`. Red orb: top-right.

---

## 5. Technical Easter Eggs

Scattered throughout as ambient detail — not intrusive, discovered on close reading:

| Location | Easter egg |
|---|---|
| Hero stats | `ctrl_z.count: 0` · `tokens.consumed: ∞` |
| Hero ticker | `404: bugs not found` · `push --force: never` |
| Skills section | `const tokens = Infinity // claude-powered` |
| Experience footer | `git log --author="Riaz" \| wc -l` |
| Services | HTTP method prefixes on service titles |
| Testimonials | `// peer review` · `verified by humans, not tokens` |
| Contact terminal | `ping riaz --hire` command |
| Contact submit | `git commit -m "Let's work together"` |
| Page footer | `© Riaz Ahmed · built with Next.js, caffeine & too many tokens` |
| 404 page | `Error: talent.js not found in other candidates` |

---

## 6. Responsive Behaviour

- **Desktop (≥1024px):** Full design as specced
- **Tablet (768–1023px):** Split layouts collapse to single column, font sizes scale down ~15%
- **Mobile (<768px):** Full-page snap retained, side dot nav hidden (replaced by bottom progress bar), all sections single-column
- Marquee ticker hidden on mobile (performance)

---

## 7. Performance & Accessibility

- Google Fonts: Bebas Neue + Space Mono loaded via `next/font`
- Framer Motion animations respect `prefers-reduced-motion` — disable all motion if set
- All interactive elements keyboard navigable
- Color contrast: white on `#050505` exceeds WCAG AA
- Images: `next/image` with blur placeholder
- Section landmarks: `<section>` with `aria-label` per section name
