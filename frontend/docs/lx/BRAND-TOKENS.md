# LX — brand colour tokens

Applies "Color guide (light theme)" and "Color guide (dark theme)", v1.0,
updated 24/07/2026, owner: Design team.

Everything lives in [`src/app/globals.css`](../../src/app/globals.css). Nothing
else in the module defines a colour.

---

## What changed

|                                                                         | Before                     | After                     |
| ----------------------------------------------------------------------- | -------------------------- | ------------------------- |
| Hard-coded hex in components                                            | **214** across 21 files    | **0**                     |
| Stock Tailwind palette utilities (`stone-*`, `red-600`, `amber-100`, …) | **~250**                   | **0**                     |
| Colour definitions                                                      | scattered across ~21 files | one file                  |
| Dark theme                                                              | none                       | full, from the dark guide |

67 files changed. All colour now resolves through a token, so a palette change
is a one-file edit and both themes follow automatically.

---

## The two rules this follows

**1. Primitives are copied verbatim.** Every hex in the primitive block appears
in one of the two PDFs. Nothing was interpolated or "corrected". The dark theme
uses the dark guide's own Background and Neutral/Grey ramps.

**2. Semantic tokens use production's variable names.** The guide names the
semantic roles (Text/primary, Background/page, Border/default …) but does not
say which primitive fills each one. Where production RishiVerse already has a
token for a role, we reuse its exact name — `--card`, `--text-heading`,
`--text-body`, `--sidebar`, `--muted-foreground`, `--card-bg-*`, `--chart-*`.

That second rule matters for the merge. The frontend integration plan asks us
to "restamp UI onto semantic tokens (`bg-primary`, `text-text-heading`)". Those
are the names used here, so that step is already done rather than pending.

---

## Matching the production UI

Read off the live app at `rishiverse.rishihood.edu.in` rather than guessed:

|         | Production                                       | Applied                   |
| ------- | ------------------------------------------------ | ------------------------- |
| Buttons | fully rounded pill, 40px, 14px/500, 8×16 padding | `Button` defaults         |
| Inputs  | 8px radius, 36px                                 | `--radius-input`          |
| Cards   | `--radius` `.625rem`                             | `--radius`                |
| Shadows | 5% alpha, barely there                           | `--shadow-xs/sm/md`       |
| Font    | system stack, no webfont                         | unchanged                 |
| Page    | `#fcfbfa` warm off-white, white surfaces         | `--background` / `--card` |
| Sidebar | `#fbf7f6` warm tint                              | `--sidebar`               |

---

## Corrected against the signed-in app

The first pass read colour off the **public login page** only. With access to
the signed-in product, three of its conclusions were wrong and have been
changed:

|                | First pass (login page only) | Corrected (signed-in app)                                                                                            |
| -------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Primary action | orange `#E85C28`, dark label | **crimson `#b61d45`, white label** — what "Join a club" and every page title actually use                            |
| Button shape   | pill everywhere              | **`--radius` 10px**; only the sheet footer pair is a pill (the login screen is pill-only because it is an auth form) |
| Orange ramp    | the action colour            | **the sidebar's active state only** — `#FFF1EB` pill with a `#CA4317` label                                          |

So the roles now follow the product, while the primitives stay the guide's.
Production runs **two** primary treatments and they are not interchangeable:

- **Page CTA** — solid crimson, white label, 10px radius, 36px. Sits beside the
  page title.
- **Sheet / auth submit** — peach `#F8DDCA` **pill** with `#32302F` text, 40px,
  sharing the footer with a pill-outline Cancel. Production's own class is
  `bg-[#F8DDCA] … disabled:opacity-60`, so the peach is the enabled colour, not
  a disabled state. It measures 10.12:1 and is the same in both themes.

Page titles are crimson (`--primary-text`), bold, 24px. In dark that token
lightens to `#e05878`, because `#b61d45` as _text_ on `#1a1919` is 2.72:1 —
while the crimson _fill_ stays, since a fill is measured against its own label.

**If Design rules that the guide's orange should win instead, it is two values:**
`--primary` and `--primary-text` in `globals.css`. Everything else is derived.

---

## Widget guide review (26 Sep 2026)

Checked the module against the RishiVerse **Widgets** board. Most of it already
matched, so this records what was verified as much as what changed — the guide
was reviewed in full, not sampled.

### Already matching, left alone

| Widget          | Why no change                                                                                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form dialogs    | The guide's dialog is a titled header with an X, a scrolling body and a sticky footer holding a pill **Cancel** and a peach pill primary. That is exactly `components/ui/sheet.tsx` + the `SheetCancelButton` / `SheetSubmitButton` pair.                                                                                       |
| Tables          | The guide's table is a rounded, bordered, clipped container with a tinted header row and a rule under each row. LX's tables already render `rounded-xl border border-border bg-card` with a `bg-subtle` header and `divide-y`. A `DataTable` component was written, found redundant, and deleted rather than left as dead code. |
| Status pills    | Soft fill, strong text, pill radius — `Badge` already.                                                                                                                                                                                                                                                                          |
| Upload dropzone | Dashed border, centred icon, label, hover state — already.                                                                                                                                                                                                                                                                      |
| Detail views    | Grey label / dark value in two columns — already.                                                                                                                                                                                                                                                                               |
| Shell           | Logo left, bell and account right; icon rail with a peach active pill — already.                                                                                                                                                                                                                                                |

### Changed

**Summary tiles** — `components/ui/stat-tile.tsx`. LX had bordered white cards
with an icon chip and the label _under_ the number. The guide's tile is a flat
tinted fill, no border, no shadow, no icon, with the label _above_ the number.
Applied on the dashboard, analytics and budget.

The tone carries meaning rather than decoration — `warning` for things waiting,
`success` for things finished. One wrinkle: `brand` maps to the **peach**
`--brand-subtle`, not `--primary-subtle`. Since `--primary` is crimson here,
the primary tint is pink, and a pink summary tile reads as an error rather than
a headline figure.

**Upload constraints** — the guide prints `Supported: … | Max file size: …`
under every dropzone. `FileUploader` already knew both values and was not
showing them, so the limit was only discoverable by tripping over it.

---

## The shell

Matches production's chrome rather than the kit's.

**Header.** A 78px transparent bar — no fill, no bottom rule — with the wide
Rishihood logo on the left (`public/rishihood-logo.svg`, 136px) and the account
controls on the right. It carries no page title and no product name; the title
belongs to the page. This replaces a bar that printed "RISHIVERSE × LXOS /
Learner Experience OS", which exists nowhere in the real product.

**Sidebar.** The full-width labelled list is gone, replaced by production's
expandable icon rail:

|           |                                                                                            |
| --------- | ------------------------------------------------------------------------------------------ |
| Collapsed | 60px, icons only, label shown as a dark tooltip at `left-full ml-2` on hover               |
| Expanded  | **220px**, labels animating in from zero width                                             |
| Row       | 40px, `rounded-2xl`, fixed 44px icon column so icons never shift between states            |
| Icon      | 20px; active `#CA4317`, idle `--sidebar-icon` with a `--sidebar-icon-hover` hover          |
| Label     | 14px medium; active `#CA4317`, idle `--sidebar-label` with a `--sidebar-label-hover` hover |
| Active    | `--sidebar-accent` pill (`#FFF1EB`) with a `--sidebar-accent-foreground` label (`#CA4317`) |
| Scroller  | `max-h-[58dvh]`, `px-2 pb-4`, with the active row scrolled to centre on change             |

### Behaviour, read out of production's bundle

RishiVerse's rail handlers are React-delegated, so synthetic pointer events
never reach them and the rail looks completely inert to probing from the
console — which is why an earlier pass here wrongly concluded it does not
respond to hover at all. The component was instead read out of the shipped
JS. It is driven by a **three-state lock**, not a boolean:

```
lockState: "auto" | "locked-open" | "locked-closed"
expanded  = lockState === "locked-open" || (lockState === "auto" && hovered)
```

|                   |                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| In `auto`         | the rail follows the cursor — opens **60ms** after the pointer enters, closes **immediately** on leave, with no close delay |
| The toggle        | only exists once the rail is already open. It locks whichever state you are looking at, so it reads as "keep it like this"  |
| Clicking it again | hands control back to the cursor. The icon is a chevron in `auto` and a **padlock** while locked                            |
| `locked-closed`   | hovering is ignored entirely — the rail stays at 60px                                                                       |

The rail is in **normal flow, so expanding pushes the page** (content's left
edge moves 92 → 252). An earlier pass here made hover overlay the page instead,
on the reasoning that reflowing was worse than a peek; that is simply not what
the product does, and this now matches it.

Production animates the width with a framer-motion spring (stiffness 200,
damping 30, mass 0.9 — a damping ratio of about 1.12, so overdamped and free of
overshoot). framer-motion is not a dependency here and the plan forbids adding
one, so a `cubic-bezier(0.25, 1, 0.5, 1)` curve stands in for it.

The lock state persists in `localStorage` and is read through
`useSyncExternalStore`, so the server snapshot (`auto`, production's default)
cannot disagree with the client on first paint. Touch pointers are excluded
(`pointerType !== "mouse"`) and the transition is dropped under
`prefers-reduced-motion` — two things production does not do.

Mobile keeps the drawer. Production uses a bottom tab bar there, but that caps
out at about five destinations and LX has eighteen.

### One defect this surfaced

The supplied logo is a single raster whose wordmark is **100% dark ink** —
measured, 1617 dark pixels and zero light. On the dark theme it all but
disappears. `invert` would fix the wordmark and simultaneously turn the shield
from brand orange to cyan, so the logo instead keeps its exact colours and sits
on a light plate in dark mode.

**The real fix is a dark-theme logo variant from Design.** Production never hit
this because its dark theme is unfinished.

---

## How things open

Production has no centred modal anywhere. It uses:

- **A full page at a sub-route** for large multi-section forms — `Raise a
concern` goes to `/complaint/raise-concern` with a back affordance.
- **A sheet** for everything else: a right-hand panel `w-[520px]` at ≥640px, a
  bottom sheet with a grab handle below that. 64px header with the title and an
  X, a rule under it, a scrolling body, and a sticky footer holding
  Cancel + submit.

LX used centred `fixed inset-0` modals, which this product does not have. All
**17** of them now go through `src/components/ui/sheet.tsx`, so moving between
LX and the rest of RishiVerse no longer changes how a form behaves. The image
lightbox in `ProductCard` stays a lightbox — it is not a form.

The shared `Sheet` also adds what the hand-rolled modals lacked: Escape closes,
focus moves to the first **field** (not the close button) and returns to the
trigger on close, background scroll is locked, and a drag that starts inside the
panel and ends on the backdrop does not discard a half-filled form.

Emoji are gone — production uses none.

---

## Three things that need a decision

### 1. Primary is now orange, not `#b61d45`

Production currently sets `--primary: #b61d45` (crimson) while also carrying an
orange `--primary-50…700` ramp, and its sign-in CTA renders from the orange
family. The two disagree with each other.

The guide resolves it: **Primary is the orange ramp** (`#E85C28` at 500) and
**Secondary is the crimson ramp** (`#D00636` at 500). `#b61d45` sits near the
guide's secondary-600/700, so production's `--primary` is really the brand's
_secondary_.

This module now follows the guide. Since the plan says never to copy the kit's
`globals.css`, nothing breaks at merge either way — but **v2's own `--primary`
still needs updating for the app to actually look like the guide.** Flagging
rather than assuming.

### 2. Primary buttons carry dark text, and hover lightens

Measured, not stylistic:

| Pair                                   | Ratio      |                           |
| -------------------------------------- | ---------- | ------------------------- |
| `#E85C28` + white                      | **3.50:1** | fails AA for a 14px label |
| `#E85C28` + `#1D1C1B`                  | **4.86:1** | passes                    |
| `#D35424` (hover, darker) + `#1D1C1B`  | 4.10:1     | fails                     |
| `#ED7D53` (hover, lighter) + `#1D1C1B` | 6.21:1     | passes                    |

So the primary action is orange with near-black text, and hover goes _lighter_.
This also matches what production actually renders — a peach fill with dark
text, not white on orange.

### 3. Two production text tokens fail AA

Against the page background:

| Token                | Production value | Ratio  |                 |
| -------------------- | ---------------- | ------ | --------------- |
| `--text-body`        | `#7e7a79`        | 4.11:1 | fails AA normal |
| `--text-placeholder` | `#afaaa6`        | 2.23:1 | fails           |

The guide's own principle 4 is "maintain sufficient colour contrast (WCAG 2.1
AA)", so this module uses the next step down the brand neutral ramp —
`--text-body: #6a6766` (5.43:1). Same role, near-identical appearance, passes.
Worth fixing in v2 too.

---

## Dark theme

Built from the dark guide, **not** from production. Production's `.dark` block
is unfinished — it leaves `--text-heading` at `#1f1e1e` over a `#0a0a0a` page
(near-invisible), keeps the light peach `--card-bg-*` ramp, and drops
`--primary` to grey `#e5e5e5`, losing the brand entirely. None of that was
copied.

Page `#1a1919`, surfaces `#1d1c1b`, recessed `#151413`, text from the
Neutral/Grey ramp. Borders are white alphas rather than ramp steps so they sit
correctly on every layer. Status badges use the 900 step with the 200 step on
top (6.3–6.8:1). The primary ramp is identical in both themes, so the brand
orange holds.

Theme selection is light / system / dark. "System" is a real third state: the
tokens respond to `prefers-color-scheme` as well as an explicit `.dark` class.

**The toggle is kit-only.** `app/(erp)/layout.tsx` is on the plan's "never copy"
list, so the control demonstrates the dark theme here and does not follow the
module into v2 — where the shell owns theme switching.

---

## Using the tokens

Badges go through `Badge` in `src/components/ui/badge.tsx`, which exposes seven
tones (`neutral`, `primary`, `secondary`, `info`, `success`, `warning`,
`error`). Pick the role; the tokens decide the colour in each theme.
`approvalTone(status)` maps the approval lifecycle shared by events, expenses,
products, achievements, reimbursements and lost-and-found, so "Approved" looks
the same everywhere.

`class-variance-authority` is **not** a dependency here and was not added — the
plan forbids new deps without approval — so variants are plain lookup maps fed
through the existing `cn`. They port to CVA directly if v2 prefers that.

Rules of thumb:

- Never write a hex or a stock palette class in a component.
- Text: `text-text-heading` / `text-text-subheading` / `text-text-body`.
- Surfaces: `bg-background` (page), `bg-card` (surface), `bg-subtle`, `bg-muted`.
- Status: `bg-*-subtle` + `text-*-subtle-foreground` for badges; solid `bg-*`
  with `text-*-foreground` for filled buttons — never `text-white`, which fails
  on `--success` and `--warning` in dark.
- Categories are not statuses. Prefer `neutral` unless the value genuinely
  means something.

---

## Verified

0 lint errors, 0 warnings, type-check clean, production build compiles all 30
routes, prettier clean. Light and dark checked in-browser on dashboard, events,
calendar, analytics and library; contrast ratios in this document were computed
from the guide's own hex values, not estimated.
