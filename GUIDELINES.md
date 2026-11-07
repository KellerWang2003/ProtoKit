# Debug panel guidelines

How the debug panel behaves, how it looks, and how to add controls so every prototype's panel feels like the same tool.

## 1. Principles

1. **It's backstage.** The panel is for us, never part of the product. Nothing in it should look like app UI, and nothing in the app should depend on it being open.
2. **Out of the way by default.** One small button, draggable, remembered where you left it. On shared links it is hidden entirely until unlocked.
3. **Recording-ready in one keystroke.** `` ` `` closes the panel; the frame, background and status bar stay exactly as set. Nothing debug-related ever appears in a recording unless you want it to.
4. **Everything remembers.** Every control survives a reload. Reloading mid-demo should land you exactly where you were.
5. **Jump, don't click through.** Controls should take you straight to a state ("Empty state", "Lose streak", "Evening") instead of making you replay a flow.
6. **Same shape everywhere.** Recording tab first, your tabs after, the same control types, the same words.

## 2. Anatomy

```
┌─────────────────────────────────┐
│ Debug · Name  ⠿              ×  │  title bar: drag handle, close
│ [ 03 Home                   ▾ ] │  screen picker (only with `screens`)
│ Recording   Demo   Playgrounds  │  tabs
├─────────────────────────────────┤
│ SECTION TITLE                   │
│ ┌─────────────────────────────┐ │
│ │ Row                     ◯━  │ │  group: rows split by hairlines
│ │ Row                     ━◯  │ │
│ └─────────────────────────────┘ │
│ Note under the group.           │
│ …                               │  body scrolls
├─────────────────────────────────┤
│ ` panel  ← → screens  F frame   │  footer: live shortcut list
└─────────────────────────────────┘
```

- **Width** 300 px on desktop; a bottom sheet on phones.
- **Placement** bottom left by default; drag by the title bar to anywhere, remembered per prototype. While open on a wide window, the device shifts right so the panel doesn't cover it.
- **Launcher** a dark pill reading "Debug", bottom left, draggable. On phones it's a translucent tab on the screen edge that snaps to the nearer side (no edge swipe, which fights the browser's swipe back).

## 3. States

| State | What shows | How you get there |
| --- | --- | --- |
| Locked | Nothing | Default with `unlock="hold"` (shared links) |
| Unlocked, closed | Debug button | Press and hold one spot 4 s, or open with `?debug`. Lasts for the browser session |
| Open | Panel | Tap Debug, or `` ` `` |
| Recording | Nothing, frame and background stay | "Hide Debug button" on, then `` ` `` to close. `` ` `` brings the panel back |

The press that unlocks never also taps what's under it.

## 4. Tabs

1. **Recording** (built in, always first): device, finish, landscape, fit, status bar, home indicator, background, hide button, reset.
2. **Your tabs**, in the order they first appear. Recommended names, so prototypes match:
   - **Demo**: data and story states for the walkthrough (empty state, time of day, user stage, fake progress).
   - **Playgrounds**: things that open over the app (design system, motion studies, alternate directions). Use `DebugLink`.
   - **Debug** (the default if you don't name a tab): developer-only switches (mock latency, log events, feature flags).

Keep it to four tabs or fewer. If a tab has more than ~4 sections, split it.

## 5. Controls: which one when

| Need | Control | Example |
| --- | --- | --- |
| On / off | `DebugToggle` | Empty state, Hide navigation |
| 2–5 exclusive choices | `DebugSegmented` | Morning / Afternoon / Evening |
| 6+ choices, or grouped | `DebugSelect` | Prompt of the day, Screen |
| Do something once | `DebugButton` inside `DebugButtons` | Reset demo, Max streak |
| Open/close an overlay | `DebugLink` | Design system → |
| A number with a range | `DebugSlider` | Watering streak (0–30) |
| An exact number | `DebugNumber` | Seed, Delay (ms) |
| Free text | `DebugText` | User's name |
| A color | `DebugColor` | Accent |
| Show live state | `DebugValue` | Score: 12 |

Rules:

- **State lives in `useDebugState`**, keyed `area.thing` (`today.empty`, `archive.direction`). The screen reads the same key, so the panel and the app never drift.
- **Destructive buttons** (clear saved data, reset) use `variant="danger"` and sit last in their group.
- **One primary button at most** per section (`variant="primary"`), usually none.
- **Notes explain side effects or requirements**, not what the control is: "The camera needs https or localhost." not "Turns on the camera."

## 6. Words

- Labels are **sentence case**, short, and name the state you get: "Empty state", "Hide status bar", "Photo wall". Not "Toggle empty", "isEmpty", "Enable feature X".
- Section titles are nouns: "Phone", "Today", "Archive direction". Rendered uppercase automatically.
- Choices name what you'll see: "Live time / 9:41 / Hidden", not "On / Off / Auto".
- Buttons start with a verb when it isn't obvious: "Reset demo", "Clear my saved captures".
- No emojis in labels.

## 7. Keyboard

| Key | Action | Notes |
| --- | --- | --- |
| `` ` `` | Open / close the panel | Works even with the button hidden |
| `Esc` | Close the panel | |
| `F` | Device frame on / off | |
| `←` `→` | Previous / next screen | With `screens` |
| yours | `useDebugShortcut` | Single letters or digits; shown in the footer |

Shortcuts only work once unlocked, never while typing in a field, and never with ⌘ / Ctrl / Alt held (so browser shortcuts stay intact). Reserve digits `1`–`9` for "jump to state N" (like Baton's user stages), letters for toggles named by their first letter (`E` empty, `S` sheet). Add the key as the toggle's `hint` so it's discoverable in place.

## 8. Recording workflow

1. Recording tab: pick the device and finish, turn on **Fit to window** (or off for 1:1 pixels on a big screen).
2. Status bar **9:41** for a timeless shot, or **Live time**. Flip **Status bar text** to Light on dark screens (or set it from the app with `useProto().update({ statusBarTone: 'light' })` per screen).
3. Background: **Green screen** to key out later, or a brand color.
4. Set up the demo state from your Demo tab.
5. Turn on **Hide Debug button**, press `` ` ``. Record. Press `` ` `` to come back.

On a real phone (opened over wifi), the frame steps aside and the app fills the screen, so you can film hands-on footage with the same build.

## 9. Visual tokens

The panel is neutral on purpose so it reads as tooling next to any brand. Tokens, set on `.pk-ui`:

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--pk-surface` | `#ffffff` | `#1d1d20` | Panel |
| `--pk-surface-muted` | `#f3f3f1` | `#28282c` | Groups |
| `--pk-hover` | `#e9e9e6` | `#333338` | Row hover |
| `--pk-line` | 8% black | 8% white | Hairlines |
| `--pk-ink` | `#18181a` | `#f2f2f3` | Text |
| `--pk-ink-muted` | `#6b6b70` | `#a0a0a8` | Section titles, notes |
| `--pk-ink-faint` | `#a3a3a8` | `#6c6c74` | Hints |
| `--pk-accent` | `#18181a` | `#f2f2f3` | On switches, selected pills |
| `--pk-radius` | 16 px | | Panel |
| `--pk-radius-control` | 10 px | | Groups |

Type: system UI, 13 px body, 12 px controls, 11 px section titles (uppercase, +4% tracking) and notes. Rows are at least 36 px tall. To re-skin, override the tokens in your own CSS: `.pk-ui { --pk-accent: #2f7d4f }`.

## 10. Building screens for the frame

- Size with `h-full` / `100%`, never `100vh` (that's the browser window, not the phone).
- `position: fixed` stays inside the phone.
- Portal dialogs into `useProto().screenElement`, not `document.body`.
- Use container queries (`@container`, Tailwind `@md:`) instead of viewport breakpoints; the app box is an inline-size container named `proto`.
- Respect `--proto-safe-top/bottom/left/right` when you use `safeArea="overlay"` for full-bleed screens.
