# ProtoKit

Drop-in device frames and a debug panel for React prototypes. The panel is [DialKit](https://github.com/joshpuckett/dialkit).

Wrap your app once and you get:

- **Device frames** drawn in CSS: iPhone Pro, iPhone Pro Max, iPhone SE, Pixel, iPad mini, or a custom size. Four finishes, landscape, live status bar, Dynamic Island / punch hole, home indicator. Scales to fit the window and stays sharp.
- **No frame / responsive mode** (press `F`): the app fills the window.
- **Real phones just work**: opened on a phone, the app fills the screen.
- **A DialKit panel** with a Device section built in. Any `useDialKit` call in your app adds its own section to the same panel.
- **Keyboard**: `` ` `` hides or shows all debug UI (for clean recordings), `F` toggles the frame, `←` `→` step through screens.

React 18 or 19. No Tailwind needed.

## Install

```bash
npm i github:KellerWang2003/protokit
```

## Use

```tsx
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

### Your own controls

Import `useDialKit` from `proto-kit` (so your app and ProtoKit share one DialKit) and call it anywhere:

```tsx
import { useDialKit } from 'proto-kit'

function Card() {
  const { radius, color, shadow } = useDialKit('Card', {
    radius: [24, 0, 64],
    color: '#5b6cff',
    shadow: true,
  })
  return <div style={{ borderRadius: radius, background: color, boxShadow: shadow ? '0 8px 24px #0003' : 'none' }} />
}
```

Sliders, toggles, selects, colors, springs, easing curves, XY pads, actions and folders are all available. See the [DialKit docs](https://github.com/joshpuckett/dialkit#controls).

### Screens

Pass a list of screens to get a Screen picker in the Device section plus `←` `→`:

```tsx
const screens = [
  { id: 'welcome', label: 'Welcome', group: 'Onboarding' },
  { id: 'home', label: 'Home', group: 'App' },
]
const [screen, setScreen] = useDebugState('screen', 'welcome')

<ProtoKit name="Baton" screens={screens} screen={screen} onScreenChange={setScreen}>
```

## Props

| Prop | Default | What it does |
| --- | --- | --- |
| `name` | | Keeps this prototype's settings apart from others on localhost |
| `unlock` | `'always'` | `'hold'` hides the panel until you press and hold anywhere for 4 s, or open with `?debug` |
| `defaults` | | Starting settings, e.g. `{ device: 'pixel', color: 'silver' }` |
| `screens`, `screen`, `onScreenChange` | | Screen picker and `←` `→` |
| `safeArea` | `'inset'` | `'inset'` keeps the app clear of the status bar and home indicator. `'overlay'` runs edge to edge; pad with the CSS variables below |
| `screenBackground` | `#fff` | Screen color behind the app |
| `backdrop` | `#ececea` | Page color behind the device |
| `caption` | | A line under the device |
| `theme` | `'auto'` | Panel theme: `'light'`, `'dark'` or `'auto'` |
| `defaultOpen` | `true` | Whether the panel starts open |

## Building screens that fit the frame

- Use `h-full` / `100%`, not `h-screen` / `100vh` (that's the browser window). `var(--proto-screen-height)` is there if you need a number.
- `position: fixed` stays inside the phone.
- Portal dialogs into `useProto().screenElement`, not `document.body`.
- Use container queries (`@container`, Tailwind `@md:`); the app box is an inline-size container named `proto`.
- Safe areas: `--proto-safe-top`, `--proto-safe-bottom`, `--proto-safe-left`, `--proto-safe-right`.

## Hooks

- `useDialKit(name, config)`: DialKit, re-exported.
- `useDebugState(key, initial)`: like `useState`, remembered across reloads.
- `useProto()`: `{ device, framed, isPhone, screenSize, screenElement, settings, update }`.

## Develop

```bash
npm install
npm run dev      # demo app at localhost:5173
npm run build    # dist/
```
