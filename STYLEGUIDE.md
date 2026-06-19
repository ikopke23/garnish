# Garnish — Design System

The tokens, type, and components behind the family-cookbook prototype, captured as it migrates to shadcn. Two token layers describe the same palette: the prototype ships `--g-*` custom properties; the shadcn target maps each onto a semantic variable.

**Three schemes ship** — Fire & Ember (default), Sage & Olive, Plum & Bone — each in **light and dark**, for six surfaces total. Every component is built to work across all of them; no hardcoded colors.

---

## 1. Principles

Five commitments the whole system answers to. When a decision is ambiguous, these break the tie.

1. **Editorial, not utilitarian.** A family cookbook, not a grocery app. Serifs, drop caps, wide photos, stories. It should feel like a cookbook you inherited.
2. **Two reading modes.** *Browse* — everything visible, scannable. *Cook* — single step, big text, minimal chrome. Both live on one page, toggled in place.
3. **Progress is visible.** Checking ingredients and completing steps updates a visible `x / y` counter. The cook always knows where they are.
4. **Theme is first-class.** Three schemes × light/dark = six surfaces. Every component works in all six.
5. **One breakpoint.** 760px. Above is two-column desktop; below is stacked mobile. There is no tablet tier.

---

## 2. Color

Each token carries two names — the prototype's `--g-*` prop and the shadcn semantic variable it maps to — plus a role.

| Token | `--g-*` | shadcn | Role |
|---|---|---|---|
| Background | `--g-bg` | `--background` | Page surface |
| Card | `--g-card` | `--card` · `--popover` | Raised surface, dropdowns, inputs-on-dark |
| Foreground | `--g-text` | `--foreground` | Primary text + headings |
| Muted | `--g-muted` | `--muted-foreground` | Captions, metadata, eyebrows |
| Primary | `--g-primary` | `--primary` · `--ring` | Brand, CTAs, links, focus ring |
| Secondary | `--g-secondary` | `--secondary` | Amber accent, progress fill |
| Accent | `--g-accent` | `--accent` · `--destructive` | Stories, danger zone, delete |
| Border | `--g-border` | `--border` · `--input` | Hairlines, dividers, input frames |

### Fire & Ember — default

| Token | Light | Dark |
|---|---|---|
| `--g-bg` | `#FFEAAE` | `#0A0903` |
| `--g-card` | `#FFF8EE` | `#14100A` |
| `--g-text` | `#0A0903` | `#FFEAAE` |
| `--g-muted` | `#7A6030` | `#B59660` |
| `--g-primary` | `#FF8200` | `#FF8200` |
| `--g-secondary` | `#FFC100` | `#FFC100` |
| `--g-accent` | `#FF0000` | `#FF0000` |
| `--g-border` | `rgba(255,130,0,0.25)` | `rgba(255,194,0,0.20)` |

### Sage & Olive

| Token | Light | Dark |
|---|---|---|
| `--g-bg` | `#F2EEE2` | `#14160E` |
| `--g-card` | `#FBF8F0` | `#1D2015` |
| `--g-text` | `#1F2517` | `#E9E4C8` |
| `--g-muted` | `#6B7055` | `#9AA07A` |
| `--g-primary` | `#5F7A3F` | `#A8C578` |
| `--g-secondary` | `#B89D3C` | `#D4D99E` |
| `--g-accent` | `#A64B2A` | `#E8743A` |
| `--g-border` | `rgba(95,122,63,0.22)` | `rgba(168,197,120,0.22)` |

### Plum & Bone

| Token | Light | Dark |
|---|---|---|
| `--g-bg` | `#F5EFE6` | `#110A0F` |
| `--g-card` | `#FBF6EC` | `#1D1219` |
| `--g-text` | `#241419` | `#EFDED5` |
| `--g-muted` | `#6F5866` | `#A48692` |
| `--g-primary` | `#6B2E4E` | `#C48CAF` |
| `--g-secondary` | `#C08A5C` | `#E8C4BC` |
| `--g-accent` | `#A43F3F` | `#F0B15E` |
| `--g-border` | `rgba(107,46,78,0.22)` | `rgba(196,140,175,0.22)` |

### Equipment-chip palette

Derived surfaces for tag-like elements. Chips alternate between `bg-0` and `bg-1`.

| Token | Ember L | Ember D | Sage L | Sage D | Plum L | Plum D |
|---|---|---|---|---|---|---|
| `--g-chip-bg-0` | `rgba(255,130,0,.18)` | `rgba(255,130,0,.32)` | `rgba(95,122,63,.16)` | `rgba(168,197,120,.20)` | `rgba(107,46,78,.14)` | `rgba(196,140,175,.22)` |
| `--g-chip-bg-1` | `rgba(255,193,0,.18)` | `rgba(255,193,0,.28)` | `rgba(184,157,60,.20)` | `rgba(212,217,158,.22)` | `rgba(192,138,92,.22)` | `rgba(232,196,188,.22)` |
| `--g-chip-text` | `#7A2E00` | `#FFD4A0` | `#3A4F28` | `#D3DE9E` | `#481A30` | `#ECCEDB` |

> **Derived values.** `--g-muted-bg` (subtle row tint) = `rgba(0,0,0,0.03)` in light, `rgba(255,255,255,0.04)` in dark. `--g-nav-bg` = `--g-primary` in light, `--g-bg` in dark. `--g-nav-fg` = `#fff` in light, `--g-text` in dark.

---

## 3. Typography

Two serifs do all the work. **Cinzel** — small-caps, generously letter-spaced — carries every heading, label, and figure. **Lora** handles body copy and the italic story voice. **Georgia** is the system fallback for both.

- **Cinzel:** weights 400 / 500 / 600 / 700. Letter-spacing 0.02em–0.08em by size.
- **Lora:** weights 400 / 500 / 600 / 700 + italic 400 / 500.

```
Cinzel: 400, 500, 600, 700
Lora:   400, 500, 600, 700 + italic 400, 500
```

### Type scale

| Use | Font | Desktop / Mobile |
|---|---|---|
| Recipe hero (H1) | Cinzel 600 | 42 / 26 px |
| Page title (H1) | Cinzel 600 | 34 / 26 px |
| Card / family (H2) | Cinzel 600 | 20 px |
| Stat figure | Cinzel 600 | 22 px |
| Section label | Cinzel 500, LS 2px, UPPERCASE | 11 px |
| Eyebrow | Lora, LS 1.6px, UPPERCASE | 10.5 px |
| Body | Lora 400 | 14.5 px |
| Story body | Lora *italic* 400 | 13.5 px |
| Metadata | Lora 400 | 12 px |

---

## 4. Spacing & shape

Flat by default — cards earn elevation only when they overlap a hero. One border color, theme-aware, 1px; emphasis steps up to 1.5px primary.

### Radius

| Name | Value | Use |
|---|---|---|
| `sm` | 4px | Inputs, buttons, chips, bars |
| `md` | 6px | Cards, sections, panels |
| `lg` | 8px | Elevated cards, modals, dropdowns |
| `pill` | 20px | Toggle pills, badges, member chips |

### Borders & emphasis

- **1px `--g-border`** — the default hairline and divider.
- **4px left rule `--g-primary`** — spotlight cards (e.g. favorite recipe).
- **3px left rule `--g-accent`** — story banners.
- **3px top rule `--g-primary`** — family cards.
- **1px dashed `--g-border`** — empty states and add rows.

### Elevation

- **Flat** — the default for all cards.
- **`0 8px 24px rgba(0,0,0,0.18)`** — reserved for cards overlapping a hero photo, dropdowns, and modals.

### Spacing rhythm (desktop / mobile)

| Measure | Value |
|---|---|
| Page padding | 32 / 16 px |
| Card padding | 18–22 / 14–16 px |
| List gap | 14 px |
| Inline gap | 6–8 px |
| Section gap | 22 px |

---

## 5. Components

### Buttons

Four roles. Lora 600 at 12.5px; first-person verbs.

- **Primary** — `--g-primary` bg, `#fff` text, no border, 4px radius. Padding `8px 14px`.
- **Ghost** — transparent, `--g-text`, 1px `--g-border`, 4px radius. Padding `7px 13px`.
- **Destructive** — primary shape with `--g-accent` bg.
- **Toggle pill** — 1.5px `--g-primary` border, 20px radius, Cinzel uppercase 11.5px. Active: filled `--g-primary` with dark text.
- **Icon circle** — 30px round; `rgba(255,255,255,0.16)` on the nav, `--g-card` on dark surfaces.

### Inputs

- Background `--g-bg`, 1px `--g-border`, 4px radius, ~`8px 12px` padding, 13px Lora.
- **Focus:** border flips to `--g-primary` + `0 0 0 2px` ring at 22% alpha.
- **Placeholder:** `--g-muted` at ~0.65 opacity.
- **Field label:** Cinzel 10.5px, LS 1.5px, uppercase, `--g-muted`.
- Search field is borderless inside a bordered container with a leading magnifier icon.

### Badges, chips & avatars

- **Equipment chip** — pill radius, 12.5px, alternating `--g-chip-bg-0/1`, `--g-chip-text`.
- **Status badge** — `muted` (muted-bg + border) or `accent` (filled `--g-accent`, white).
- **Role pill** — 9.5px uppercase caps; outline `--g-primary` (admin/you) or `--g-secondary` tint (admin badge).
- **Member chip** — avatar + name in a bordered pill; the "you" variant uses a primary tint + primary border.
- **Avatar** — username initial in a primary-tinted circle, sizes 24–74; `ring` variant marks self.
- **AvatarStack** — overlapping avatars (−8px) for family rosters.
- **Pip** — `N×` times-cooked tag, Cinzel 11px, primary tint.

### Cards

One primitive — `--g-card` on a 1px border, 6px radius — specialised through a colored edge.

- **Spotlight card** — 4px left rule + primary wash. Favorite recipe.
- **Recipe row** — compact list item with a trailing pip.
- **Story card** — 3px accent left rule, italic body, 2-line clamp.
- **Family card** — 3px primary top rule, name + admin pill, member roster.

### Signature patterns

- **Story banner** — overlaps the hero photo by −14px, 4px `--g-accent` left rule; the first letter becomes a Cinzel drop cap; italic body; `— author` attribution. Carries the elevation shadow.
- **Stats strip** — 4 equal cells, Cinzel 22px primary figures over 10px uppercase muted labels.
- **Progress meter** — `x / y` Cinzel label + a 3px bar (radius 2). Fill is `--g-secondary`; both label and fill flip to `--g-primary` at completion. 250ms transition.
- **Method steps** — circular 26px number badge (1.5px primary border, Cinzel 700). Done: badge fills primary with a ✓; step text gets `opacity 0.45` + strikethrough. Numbering is continuous across sections.
- **Ingredients** — checkbox tinted to `--g-primary`, quantity in primary bold, name in `--g-text`; dotted row separators; checked rows dim + strike.

### Navigation & feedback

- **Navbar** — sticky, 58/52px. `--g-nav-bg` = primary (light) / bg (dark). Wordmark *garnish* (Cinzel 700, LS 0.08em) + route links + right-hand trio (dark toggle, theme switcher, account).
- **Theme switcher** — dropdown on the elevated 8px card; one row per scheme with a light/dark mini-swatch; current scheme marked with a 3px primary left border + wash + ✓.
- **Toast** — inverted surface (`--g-text` bg, `--g-bg` text), 4px radius, bottom-center, auto-dismiss ~2.2s.
- **Modal** — `--g-card`, 8px radius, `0 20px 60px rgba(0,0,0,0.4)`, scrim `rgba(0,0,0,0.55)` + blur; closes on Esc / backdrop.

---

## 6. shadcn mapping

For when the migration completes.

| Prototype piece | shadcn primitive |
|---|---|
| Theme switcher dropdown | `DropdownMenu` + `DropdownMenuRadioGroup` |
| Dark / light toggle | Custom button + theme provider |
| Navbar | Plain `div` — not `NavigationMenu` |
| Recipe / family card | `Card` + `CardHeader` / `CardContent` |
| Search inputs | `Input` ×2 + `Button variant="ghost"` |
| Ingredient checkboxes | `Checkbox`, accent tinted to `--primary` |
| Equipment chips | `Badge` |
| Section labels | Plain `h3` + utility classes |
| Progress meter | `Progress` — restyled to 3px + counter |
| Method step badges | Custom — no shadcn equivalent |
| Cook-mode focus card | `Card` + `border-primary border-2` |
| Prev / next controls | `Button` variant `outline` + `default` |
| Keep-screen-on toggle | `Toggle` with custom icon |
| Manage-family modal | `Dialog` |
| Back button on hero | `Button variant="secondary"` + `bg-black/45 backdrop-blur` |

---

## 7. Copy & tone

- **Em-dashes** for sentence breaks, not hyphens.
- **Lowercase eyebrows** (`tonight`, `up next`); titles stay cased (`Ingredients`, `Method`).
- **First-person actions** — *"I Cooked This"*, *"Keep screen on"*, *"Done — next step →"*.
- **Gentle empty states** — *"No recipes match — try a different search."* not an apology.

---

## 8. Responsive

Single breakpoint at **760px**. Below is mobile.

| Element | Desktop | Mobile |
|---|---|---|
| Page padding | 32px | 16px |
| Navbar height | 58px | 52px |
| Nav links | inline | second row |
| Feed card | image left 200px | image top, stacked |
| Detail hero | 360px tall | 240px tall |
| H1 title | 42px | 26px |
| Stats strip | equal columns | horizontal scroll |
| Detail body | 300px + 1fr | single column |

---

*Generated from the Garnish prototype. If a spec here conflicts with the prototype, the prototype wins.*

