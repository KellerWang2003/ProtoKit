// All styles live here and are injected once, so the package needs no CSS
// import and no Tailwind. Every class starts with pk- so nothing leaks into
// the app, and the panel's look is set by the --pk-* tokens below.

export const css = String.raw`
.pk-stage {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--pk-backdrop);
  --pk-backdrop: #ececea;
  overflow: hidden;
}
.pk-stage[data-dark] { --pk-backdrop: #18181a; }
.pk-stage[data-scroll] { overflow: auto; }

.pk-area {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}
.pk-stage[data-scroll] .pk-area { flex: none; min-height: 100%; min-width: 100%; width: max-content; padding: 32px; box-sizing: border-box; }

.pk-stage[data-panel] .pk-area { padding-left: 316px; }

.pk-fit { position: relative; flex: none; margin: auto; }
.pk-stage[data-mode="fill"] .pk-fit { flex: 1 1 auto; align-self: stretch; margin: 0; }

.pk-device {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  box-sizing: border-box;
}
.pk-stage[data-mode="fill"] .pk-device { position: absolute; inset: 0; width: 100% !important; height: 100% !important; transform: none !important; }

.pk-stage[data-mode="device"] .pk-device {
  padding: var(--pk-band);
  border-radius: var(--pk-outer-radius);
  background: linear-gradient(135deg, var(--pk-band-light), var(--pk-band-base) 30%, var(--pk-band-dark) 55%, var(--pk-band-base) 80%, var(--pk-band-light));
  box-shadow:
    0 0 0 0.5px rgba(0,0,0,.35),
    inset 0 0 0 0.5px rgba(255,255,255,.35),
    0 40px 80px -20px rgba(0,0,0,.35),
    0 20px 40px -20px rgba(0,0,0,.3);
}
.pk-stage[data-mode="box"] .pk-device {
  border-radius: 24px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.12), 0 30px 60px -20px rgba(0,0,0,.25);
}

.pk-bezel {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.pk-stage[data-mode="device"] .pk-bezel {
  padding: var(--pk-bezel);
  border-radius: calc(var(--pk-outer-radius) - var(--pk-band));
  background: #050505;
  box-shadow: inset 0 0 0 1.5px #1c1c1e;
}

.pk-screen {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--pk-screen-bg, #fff);
  /* Fixed-position elements in the app stay inside the screen */
  transform: translateZ(0);
}
.pk-stage[data-mode="device"] .pk-screen { border-radius: var(--pk-screen-radius); }
.pk-stage[data-mode="box"] .pk-screen { border-radius: 24px; }

.pk-app {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  overflow: auto;
  container-type: inline-size;
  container-name: proto;
  box-sizing: border-box;
}
.pk-app[data-safe="inset"] { padding-top: var(--proto-safe-top); padding-bottom: var(--proto-safe-bottom); }

/* Side buttons, drawn in the band's color */
.pk-button {
  position: absolute;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--pk-band-dark), var(--pk-band-light), var(--pk-band-dark));
}
.pk-button[data-side="left"] { left: -3px; border-radius: 2px 0 0 2px; }
.pk-button[data-side="right"] { right: -3px; border-radius: 0 2px 2px 0; }

.pk-island {
  position: absolute;
  top: 11px;
  left: 50%;
  width: 124px;
  height: 36px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #000;
  z-index: 2147483001;
  pointer-events: none;
}
.pk-punch {
  position: absolute;
  top: 12px;
  left: 50%;
  width: 14px;
  height: 14px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #000;
  box-shadow: inset 0 0 0 2px #151519;
  z-index: 2147483001;
  pointer-events: none;
}
.pk-home-button {
  position: absolute;
  left: 50%;
  bottom: calc((var(--pk-bezel-bottom) - 56px) / 2);
  width: 56px;
  height: 56px;
  transform: translateX(-50%);
  border-radius: 999px;
  box-shadow: inset 0 0 0 2px #26262a;
  background: #0b0b0c;
}
.pk-speaker {
  position: absolute;
  left: 50%;
  top: calc(var(--pk-bezel-top) / 2 - 3px);
  width: 48px;
  height: 6px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #1c1c20;
}

.pk-status {
  position: relative;
  flex: none;
  z-index: 2147483000;
  pointer-events: none;
  color: #000;
  font: 600 17px/1 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.pk-status[data-tone="light"] { color: #fff; }
.pk-status[data-overlay] { position: absolute; top: 0; left: 0; right: 0; }
.pk-status-time { position: absolute; display: flex; align-items: center; justify-content: center; }
.pk-status-icons { position: absolute; display: flex; align-items: center; gap: 6px; }
.pk-status[data-os="android"] { font: 500 14px/1 "Roboto", "Google Sans", system-ui, sans-serif; letter-spacing: 0; }

.pk-home-indicator {
  position: absolute;
  left: 50%;
  bottom: 8px;
  width: 36%;
  max-width: 140px;
  height: 5px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #000;
  z-index: 2147483000;
  pointer-events: none;
}
.pk-home-indicator[data-tone="light"] { background: #fff; }
.pk-home-indicator[data-os="android"] { height: 4px; width: 26%; bottom: 8px; opacity: .8; }

.pk-caption {
  flex: none;
  margin: 0 auto;
  padding: 0 16px 20px;
  max-width: 32rem;
  text-align: center;
  font: 400 13px/1.5 system-ui, sans-serif;
  color: rgba(0,0,0,.5);
}
.pk-stage[data-dark] .pk-caption { color: rgba(255,255,255,.55); }

/* ───────── Debug panel ───────── */

.pk-ui {
  --pk-surface: #ffffff;
  --pk-surface-muted: #f3f3f1;
  --pk-hover: #e9e9e6;
  --pk-line: rgba(0,0,0,.08);
  --pk-ink: #18181a;
  --pk-ink-muted: #6b6b70;
  --pk-ink-faint: #a3a3a8;
  --pk-accent: #18181a;
  --pk-on-accent: #ffffff;
  --pk-radius: 16px;
  --pk-radius-control: 10px;
  --pk-shadow: 0 1px 2px rgba(0,0,0,.06), 0 12px 32px -8px rgba(0,0,0,.22);
  font: 400 13px/1.35 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--pk-ink);
  -webkit-font-smoothing: antialiased;
  letter-spacing: 0;
  text-align: left;
}
.pk-ui[data-theme="dark"] {
  --pk-surface: #1d1d20;
  --pk-surface-muted: #28282c;
  --pk-hover: #333338;
  --pk-line: rgba(255,255,255,.08);
  --pk-ink: #f2f2f3;
  --pk-ink-muted: #a0a0a8;
  --pk-ink-faint: #6c6c74;
  --pk-accent: #f2f2f3;
  --pk-on-accent: #18181a;
  --pk-shadow: 0 0 0 1px rgba(255,255,255,.06), 0 12px 32px -8px rgba(0,0,0,.6);
}
.pk-ui *, .pk-ui *::before, .pk-ui *::after { box-sizing: border-box; }
:where(.pk-ui) :where(button, input, select) { font: inherit; color: inherit; margin: 0; }
:where(.pk-ui) :where(button) { cursor: pointer; background: none; border: 0; padding: 0; }
.pk-ui :focus-visible { outline: 2px solid #3b82f6; outline-offset: 1px; }

.pk-launcher {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 2147483600;
  touch-action: none;
  user-select: none;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--pk-accent) !important;
  color: var(--pk-on-accent) !important;
  font-weight: 600 !important;
  box-shadow: var(--pk-shadow);
}
.pk-launcher:hover { opacity: .9; }
.pk-edge-tab {
  position: fixed;
  left: 0;
  top: 50%;
  z-index: 2147483600;
  width: 22px;
  height: 72px;
  touch-action: none;
  user-select: none;
  background: rgba(0,0,0,.35) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 0 12px 12px 0 !important;
}
.pk-edge-tab[data-side="right"] { border-radius: 12px 0 0 12px !important; }

.pk-panel {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 2147483600;
  width: 300px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--pk-radius);
  background: var(--pk-surface);
  box-shadow: var(--pk-shadow);
}
.pk-panel[data-phone] { left: 8px; right: 8px; bottom: 8px; width: auto; max-width: none; max-height: 72dvh; }

.pk-panel-head { display: flex; flex-direction: column; gap: 10px; padding: 12px 12px 0; border-bottom: 1px solid var(--pk-line); }
.pk-titlebar { display: flex; align-items: center; justify-content: space-between; margin: -12px -12px 0; padding: 10px 8px 0 14px; cursor: grab; touch-action: none; user-select: none; }
.pk-titlebar:active { cursor: grabbing; }
.pk-panel[data-phone] .pk-titlebar { cursor: default; }
.pk-title { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; }
.pk-title-grip { color: var(--pk-ink-faint); font-weight: 400; }
.pk-title-name { color: var(--pk-ink-muted); font-weight: 500; }
.pk-icon-button { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 999px; color: var(--pk-ink-muted); font-size: 18px; line-height: 1; }
.pk-icon-button:hover { background: var(--pk-surface-muted); color: var(--pk-ink); }

.pk-tabs { display: flex; gap: 16px; overflow-x: auto; scrollbar-width: none; }
.pk-tab { padding: 0 0 8px !important; border-bottom: 2px solid transparent !important; font-size: 12px; font-weight: 600; color: var(--pk-ink-muted) !important; white-space: nowrap; }
.pk-tab:hover { color: var(--pk-ink) !important; }
.pk-tab[aria-selected="true"] { color: var(--pk-ink) !important; border-bottom-color: var(--pk-accent) !important; }

.pk-panel-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 16px; overscroll-behavior: contain; }
.pk-panel-foot { padding: 8px 12px; border-top: 1px solid var(--pk-line); font-size: 11px; color: var(--pk-ink-muted); display: flex; flex-wrap: wrap; gap: 4px 10px; }
.pk-kbd { display: inline-block; min-width: 16px; padding: 1px 4px; margin-right: 3px; border-radius: 4px; background: var(--pk-surface-muted); text-align: center; font: 600 10px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--pk-ink); }

.pk-section { display: flex; flex-direction: column; gap: 6px; }
.pk-section-title { margin: 0; padding: 0 4px; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--pk-ink-muted); }
.pk-group { display: flex; flex-direction: column; overflow: hidden; border-radius: var(--pk-radius-control); background: var(--pk-surface-muted); }
.pk-group > * + * { border-top: 1px solid var(--pk-line); }
.pk-note { margin: 0; padding: 0 4px; font-size: 11px; line-height: 1.4; color: var(--pk-ink-muted); }
.pk-empty { padding: 24px 8px; text-align: center; color: var(--pk-ink-muted); }

.pk-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 36px; padding: 6px 10px; width: 100%; text-align: left; }
button.pk-row:hover { background: var(--pk-hover); }
.pk-row-label { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.pk-row-label > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pk-row-hint { font-size: 11px; color: var(--pk-ink-faint); }
.pk-row-stack { flex-direction: column; align-items: stretch; gap: 6px; padding: 8px 10px; }
.pk-row-stack > .pk-row-label { font-size: 12px; color: var(--pk-ink-muted); }

.pk-switch { flex: none; display: flex; align-items: center; width: 34px; height: 20px; padding: 2px; border-radius: 999px; background: var(--pk-line); transition: background .15s; }
.pk-ui[data-theme="dark"] .pk-switch { background: #45454b; }
.pk-switch::after { content: ""; width: 16px; height: 16px; border-radius: 999px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: transform .15s; }
.pk-switch[data-on] { background: var(--pk-accent) !important; }
.pk-switch[data-on]::after { transform: translateX(14px); background: var(--pk-surface); }

.pk-segmented { display: flex; flex-wrap: wrap; gap: 2px; padding: 2px; border-radius: 999px; background: var(--pk-surface); }
.pk-segmented[data-wrap] { border-radius: 12px; }
.pk-segment { flex: 1 1 0; padding: 5px 8px !important; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; transition: background .12s; }
.pk-segment:hover { background: var(--pk-surface-muted); }
.pk-segment[aria-checked="true"] { background: var(--pk-accent) !important; color: var(--pk-on-accent) !important; }

.pk-select, .pk-input {
  width: 100%;
  min-width: 0;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: var(--pk-surface);
  font-size: 12px !important;
}
.pk-select { appearance: auto; }
.pk-input[type="number"] { font-variant-numeric: tabular-nums; }
.pk-color { width: 40px; height: 28px; padding: 0; border: 0; border-radius: 6px; background: none; cursor: pointer; }

.pk-button-row { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 10px; }
.pk-btn { flex: 1 1 auto; padding: 6px 10px !important; border-radius: 8px; background: var(--pk-surface) !important; font-size: 12px; font-weight: 600; white-space: nowrap; }
.pk-btn:hover { background: var(--pk-hover) !important; }
.pk-btn[data-variant="primary"] { background: var(--pk-accent) !important; color: var(--pk-on-accent) !important; }
.pk-btn[data-variant="danger"] { color: #d93025 !important; }
.pk-btn[aria-pressed="true"] { box-shadow: inset 0 0 0 1.5px var(--pk-accent); }

.pk-swatches { display: flex; gap: 6px; }
.pk-swatch { width: 22px; height: 22px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
.pk-swatch[aria-checked="true"] { outline: 2px solid var(--pk-accent); outline-offset: 2px; }

.pk-size { display: flex; align-items: center; gap: 6px; }
.pk-size label { display: flex; align-items: center; gap: 4px; flex: 1; font-size: 11px; font-weight: 600; color: var(--pk-ink-muted); }

.pk-device-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.pk-device-option { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 8px 4px 6px !important; border-radius: 8px; background: var(--pk-surface) !important; font-size: 11px; font-weight: 600; color: var(--pk-ink-muted) !important; }
.pk-device-option:hover { color: var(--pk-ink) !important; }
.pk-device-option[aria-checked="true"] { color: var(--pk-ink) !important; box-shadow: inset 0 0 0 1.5px var(--pk-accent); }
.pk-device-glyph { border: 1.5px solid currentColor; border-radius: 3px; }
`
