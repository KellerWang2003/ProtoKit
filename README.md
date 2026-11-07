# ProtoKit

A drop-in debug panel and realistic device frame for React prototypes.

Wrap your app once and you get:

- **A device frame** drawn in CSS: iPhone Pro, iPhone Pro Max, iPhone SE, Pixel, iPad mini, or a custom size. Four finishes, landscape, live status bar, Dynamic Island / punch hole, home indicator. It scales to fit the window and stays sharp.
- **No frame / responsive mode** (press `F`): the app fills the window.
- **Real phones just work**: opened on a phone, the app fills the screen and the frame disappears.
- **A debug panel** with a built-in Recording tab (device, background, green screen, status bar, hide-for-recording) plus any tabs your app adds.
- **Controls that remember**: toggles, pills, selects, sliders and buttons backed by `useDebugState`, which survives reloads.
- **Keyboard first**: `` ` `` opens the panel, `F` toggles the frame, `←` `→` step through screens, and you can add your own.

No Tailwind, CSS import, or image assets needed. React 18 or 19.

See [GUIDELINES.md](./GUIDELINES.md) for how the panel behaves and how to add controls that feel consistent.

## Install

From GitHub (no npm publish needed):

```bash
npm i github:KellerWang2003/protokit
```

Or, while hacking on the kit itself, link a local copy: `npm i ../proto-kit`.

## Use

```tsx
// main.tsx
import { ProtoKit } from 'proto-kit'

createRoot(document.getElementById('root')!).render(
  <ProtoKit name="Baton" unlock={import.meta.env.DEV ? 'always' : 'hold'}>
    <App />
  </ProtoKit>,
)
```

Add `viewport-fit=cover` to your viewport meta so real phones report their safe areas:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

That's it. The Debug button sits bottom left; drag it anywhere.

### Add your own controls

Put a `DebugSection` anywhere inside `<ProtoKit>`. It renders into the panel, not where you put it, so it can live right next to the screen it controls.

```tsx
import { DebugSection, DebugToggle, DebugSegmented, DebugButton, DebugButtons, useDebugState, useDebugShortcut } from 'proto-kit'

function TodayScreen() {
  const [empty, setEmpty] = useDebugState('today.empty', false)
  const [slot, setSlot] = useDebugState<'morning' | 'evening'>('today.slot', 'morning')
  useDebugShortcut('e', () => setEmpty((v) => !v), 'empty')

  return (
    <>
      <DebugSection tab="Demo" title="Today">
        <DebugToggle label="Empty state" hint="E" value={empty} onChange={setEmpty} />
        <DebugSegmented label="Time of day" value={slot} onChange={setSlot} options={['morning', 'evening']} />
        <DebugButtons>
          <DebugButton onClick={resetDemo}>Reset demo</DebugButton>
        </DebugButtons>
      </DebugSection>

      {empty ? <EmptyToday /> : <Today slot={slot} />}
    </>
  )
}
```

### Screens

If your prototype is a flow of screens, hand them over and the panel gets a screen picker plus `←` `→`:

```tsx
const screens = [
  { id: 'welcome', label: 'Welcome', group: 'Onboarding' },
  { id: 'home', label: 'Home', group: 'App' },
]
const [screen, setScreen] = useDebugState('screen', 'welcome')

<ProtoKit name="Baton" screens={screens} screen={screen} onScreenChange={setScreen}>
```

With a router, pass the current path as `screen` and `navigate` as `onScreenChange`.

## Props

| Prop | Default | What it does |
| --- | --- | --- |
| `name` | | Shown in the panel title; keeps this prototype's settings apart from others on localhost |
| `unlock` | `'always'` | `'hold'` hides the Debug button until you press and hold anywhere for 4 s, or open with `?debug` |
| `defaults` | | Starting settings, e.g. `{ device: 'pixel', color: 'silver' }` |
| `screens`, `screen`, `onScreenChange` | | Screen picker and `←` `→` |
| `safeArea` | `'inset'` | `'inset'` keeps the app clear of the status bar and home indicator. `'overlay'` runs edge to edge; pad with the CSS variables below |
| `screenBackground` | `#fff` | Screen color behind the app (shows in the safe areas in inset mode) |
| `backdrop` | `#ececea` | Page color behind the device |
| `caption` | | A line under the device ("Interactive prototype…") |
| `theme` | `'auto'` | Panel theme: `'light'`, `'dark'` or `'auto'` |
| `defaultOpen` | `false` | Open the panel on first load |
| `storageKey` | from `name` | Override where settings are stored |

## Building screens that fit the frame

Your app renders into a box the size of the device screen, so:

- **Use `h-full` / `100%`, not `h-screen` / `100vh`.** The viewport is the browser window, not the phone. `var(--proto-screen-height)` is there if you need a number.
- **`position: fixed` works.** Fixed elements stay inside the phone (the screen is a containing block).
- **Portals:** dialogs portaled to `document.body` escape the phone. Portal into `useProto().screenElement` instead.
- **Responsive styles:** the app box is an inline-size container named `proto`, so use container queries (`@container`, Tailwind's `@md:`) rather than viewport media queries (`md:`).
- **Safe areas:** `--proto-safe-top`, `--proto-safe-bottom`, `--proto-safe-left`, `--proto-safe-right` are set on the screen in every mode (on a real phone they map to `env(safe-area-inset-*)`).

## API

Components: `ProtoKit`, `DebugSection`, `DebugToggle`, `DebugSegmented`, `DebugSelect`, `DebugButtons`, `DebugButton`, `DebugLink`, `DebugNumber`, `DebugSlider`, `DebugText`, `DebugColor`, `DebugValue`.

Hooks:

- `useDebugState(key, initial)`: like `useState`, remembered across reloads and shared by key.
- `useDebugShortcut(key, run, label?)`: a single-key shortcut, active once the tools are unlocked, listed in the panel footer.
- `useProto()`: `{ device, framed, isPhone, screenSize, screenElement, settings, update, panelOpen, setPanelOpen, unlocked }`. For example, flip the status bar to light text on a dark screen with `update({ statusBarTone: 'light' })`.

## Develop

```bash
npm install
npm run demo     # the Pocket Garden demo at localhost:5173
npm run build    # dist/
```
