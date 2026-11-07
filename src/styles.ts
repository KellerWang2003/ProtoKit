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

.pk-stage[data-panel] .pk-area { padding-right: 296px; }

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
`
