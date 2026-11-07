import { useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { customLimits, customPresets, deviceList, frameColors } from './devices'
import type { Device, DeviceId, FrameColor } from './devices'
import type { Screen, SectionInfo, ShortcutInfo, StageSettings } from './context'
import { DebugToggle } from './controls'
import { useDraggable } from './useDraggable'
import { useStored } from './store'

export const RECORDING_TAB = 'Device'

type PanelProps = {
  namespace: string
  name?: string
  theme: 'light' | 'dark'
  isPhone: boolean
  open: boolean
  setOpen: (open: boolean) => void
  showLauncher: boolean
  settings: StageSettings
  update: (patch: Partial<StageSettings>) => void
  reset: () => void
  sections: SectionInfo[]
  setTarget: (id: string, element: HTMLElement | null) => void
  shortcuts: ShortcutInfo[]
  screens?: Screen[]
  screen?: string
  onScreenChange?: (id: string) => void
  defaultBackdrop: string
}

export function DebugPanel(props: PanelProps) {
  const { namespace, theme, isPhone, open, setOpen, showLauncher } = props
  const panel = useDraggable(`${namespace}:ui:panel-position`)
  const launcher = useDraggable(`${namespace}:ui:launcher-position`)
  const edge = useDraggable(`${namespace}:ui:edge-position`, true)

  if (!open) {
    if (!showLauncher) return null
    if (isPhone) {
      // On a phone: a see-through tab on the screen's edge. Drag it up or down, or
      // to the other edge; a tap opens the panel. (No edge swipe: it fights the
      // browser's swipe back.)
      return (
        <div className="pk-ui" data-theme={theme}>
          <button
            type="button"
            data-pk-draggable=""
            className="pk-edge-tab"
            data-side={edge.side}
            style={edge.style}
            aria-label="Open debug panel"
            {...edge.handlers}
            onClick={() => !edge.wasDragged() && setOpen(true)}
          />
        </div>
      )
    }
    return (
      <div className="pk-ui" data-theme={theme}>
        <button
          type="button"
          data-pk-draggable=""
          className="pk-launcher"
          style={launcher.style}
          title="Open debug panel ( ` ). Drag to move."
          {...launcher.handlers}
          onClick={() => !launcher.wasDragged() && setOpen(true)}
        >
          Debug
        </button>
      </div>
    )
  }

  return (
    <div className="pk-ui" data-theme={theme}>
      <aside className="pk-panel" data-pk-draggable="" data-phone={isPhone ? '' : undefined} style={isPhone ? undefined : panel.style} aria-label="Debug panel">
        <PanelBody {...props} dragHandlers={isPhone ? undefined : panel.handlers} />
      </aside>
    </div>
  )
}

function PanelBody({
  namespace,
  name,
  setOpen,
  settings,
  update,
  sections,
  setTarget,
  shortcuts,
  screens,
  screen,
  onScreenChange,
  dragHandlers,
}: PanelProps & { dragHandlers?: ReturnType<typeof useDraggable>['handlers'] }) {
  const tabs = useMemo(() => {
    const names: string[] = []
    for (const section of sections) if (!names.includes(section.tab)) names.push(section.tab)
    // Recording first, unless the app puts its own sections there too
    return [RECORDING_TAB, ...names.filter((tab) => tab !== RECORDING_TAB)]
  }, [sections])
  const [storedTab, setTab] = useStored(`${namespace}:ui:tab`, RECORDING_TAB)
  const tab = tabs.includes(storedTab) ? storedTab : RECORDING_TAB
  const visible = sections.filter((section) => section.tab === tab)

  return (
    <>
      <div className="pk-panel-head" style={tabs.length > 1 ? undefined : { paddingBottom: 12 }}>
        <header className="pk-titlebar" title={dragHandlers ? 'Drag to move' : undefined} {...dragHandlers}>
          <span className="pk-title">
            Debug
            {name && <span className="pk-title-name">· {name}</span>}
            {dragHandlers && <span className="pk-title-grip" aria-hidden>⠿</span>}
          </span>
          <button type="button" className="pk-icon-button" aria-label="Close debug panel" onClick={() => setOpen(false)}>
            ×
          </button>
        </header>
        {screens && screens.length > 0 && onScreenChange && <ScreenPicker screens={screens} screen={screen} onChange={onScreenChange} />}
        {tabs.length > 1 && <div role="tablist" aria-label="Debug sections" className="pk-tabs">
          {tabs.map((name) => (
            <button key={name} type="button" role="tab" aria-selected={tab === name} className="pk-tab" onClick={() => setTab(name)}>
              {name}
            </button>
          ))}
        </div>}
      </div>

      <div className="pk-panel-body" role="tabpanel">
        {tab === RECORDING_TAB && <RecordingTab settings={settings} update={update} />}
        {visible.map((section) => (
          <section key={section.id} className="pk-section">
            {section.title && <h3 className="pk-section-title">{section.title}</h3>}
            <SectionSlot id={section.id} setTarget={setTarget} />
            {section.note && <p className="pk-note">{section.note}</p>}
          </section>
        ))}
      </div>

      <footer className="pk-panel-foot">
        <Shortcut keys="`">panel</Shortcut>
        {screens && screens.length > 0 && <Shortcut keys="← →">screens</Shortcut>}
        <Shortcut keys="F">frame</Shortcut>
        {shortcuts
          .filter((shortcut) => shortcut.label)
          .map((shortcut) => (
            <Shortcut key={shortcut.id} keys={shortcut.key}>
              {shortcut.label}
            </Shortcut>
          ))}
      </footer>
    </>
  )
}

// A stable ref per section, so the app's DebugSection can portal into it
function SectionSlot({ id, setTarget }: { id: string; setTarget: (id: string, element: HTMLElement | null) => void }) {
  const ref = useCallback((element: HTMLDivElement | null) => setTarget(id, element), [id, setTarget])
  return <div className="pk-group" ref={ref} />
}

function Shortcut({ keys, children }: { keys: string; children: ReactNode }) {
  return (
    <span>
      <span className="pk-kbd">{keys}</span>
      {children}
    </span>
  )
}

function ScreenPicker({ screens, screen, onChange }: { screens: Screen[]; screen?: string; onChange: (id: string) => void }) {
  const groups: { group?: string; items: { screen: Screen; index: number }[] }[] = []
  screens.forEach((item, index) => {
    const last = groups[groups.length - 1]
    if (last && last.group === item.group) last.items.push({ screen: item, index })
    else groups.push({ group: item.group, items: [{ screen: item, index }] })
  })
  const option = ({ screen: item, index }: { screen: Screen; index: number }) => (
    <option key={item.id} value={item.id}>
      {String(index + 1).padStart(2, '0')} {item.label}
    </option>
  )
  return (
    <select className="pk-select" aria-label="Go to screen" value={screen ?? ''} onChange={(event) => onChange(event.target.value)} style={{ background: 'var(--pk-surface-muted)', fontWeight: 600 }}>
      {screen === undefined && <option value="">Choose a screen</option>}
      {groups.map((group, i) =>
        group.group ? (
          <optgroup key={i} label={group.group}>
            {group.items.map(option)}
          </optgroup>
        ) : (
          group.items.map(option)
        ),
      )}
    </select>
  )
}

// ───────── Recording tab ─────────

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="pk-section">
      <h3 className="pk-section-title">{title}</h3>
      <div className="pk-group">{children}</div>
      {note && <p className="pk-note">{note}</p>}
    </section>
  )
}

function DeviceGlyph({ device, landscape }: { device: Device | 'custom'; landscape: boolean }) {
  let width = device === 'custom' ? 18 : device.kind === 'tablet' ? 18 : 12
  let height = device === 'custom' ? 14 : device.kind === 'tablet' ? 24 : 22
  if (landscape && device !== 'custom') [width, height] = [height, width]
  return <span className="pk-device-glyph" style={{ width, height, borderRadius: device === 'custom' ? 2 : 3, borderStyle: device === 'custom' ? 'dashed' : 'solid' }} />
}

function RecordingTab({ settings, update }: { settings: StageSettings; update: (patch: Partial<StageSettings>) => void }) {
  const { framed, device, custom, color, fit, landscape } = settings
  const clamp = (value: number) => Math.min(customLimits.max, Math.max(customLimits.min, Math.round(value) || customLimits.min))
  return (
    <>
      <Section title="Device">
        <DebugToggle label="Device frame" hint="F" value={framed} onChange={(framed) => update({ framed })} />
        {framed && (
          <>
            <div className="pk-row pk-row-stack">
              <div role="radiogroup" aria-label="Device" className="pk-device-grid">
                {deviceList.map((item) => (
                  <button key={item.id} type="button" role="radio" aria-checked={device === item.id} className="pk-device-option" onClick={() => update({ device: item.id as DeviceId })}>
                    <DeviceGlyph device={item} landscape={landscape} />
                    {item.label}
                  </button>
                ))}
                <button type="button" role="radio" aria-checked={device === 'custom'} className="pk-device-option" onClick={() => update({ device: 'custom' })}>
                  <DeviceGlyph device="custom" landscape={false} />
                  Custom
                </button>
              </div>
            </div>
            {device === 'custom' ? (
              <div className="pk-row pk-row-stack">
                <div className="pk-size">
                  <label>
                    W
                    <input className="pk-input" type="number" min={customLimits.min} max={customLimits.max} value={custom.width} onChange={(event) => update({ custom: { ...custom, width: clamp(Number(event.target.value)) } })} />
                  </label>
                  <label>
                    H
                    <input className="pk-input" type="number" min={customLimits.min} max={customLimits.max} value={custom.height} onChange={(event) => update({ custom: { ...custom, height: clamp(Number(event.target.value)) } })} />
                  </label>
                  <button type="button" className="pk-btn" style={{ flex: 'none' }} aria-label="Swap width and height" onClick={() => update({ custom: { width: custom.height, height: custom.width } })}>
                    ⇄
                  </button>
                </div>
                <div className="pk-size">
                  {customPresets.map((preset) => (
                    <button key={preset.label} type="button" className="pk-btn" onClick={() => update({ custom: { width: preset.width, height: preset.height } })}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="pk-row">
                  <span className="pk-row-label">Finish</span>
                  <div role="radiogroup" aria-label="Frame color" className="pk-swatches">
                    {(Object.keys(frameColors) as FrameColor[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={color === key}
                        aria-label={frameColors[key].label}
                        title={frameColors[key].label}
                        className="pk-swatch"
                        style={{ background: `linear-gradient(135deg, ${frameColors[key].band[0]}, ${frameColors[key].band[2]})` }}
                        onClick={() => update({ color: key })}
                      />
                    ))}
                  </div>
                </div>
                <DebugToggle label="Landscape" value={landscape} onChange={(landscape) => update({ landscape })} />
              </>
            )}
            <DebugToggle label="Fit to window" value={fit} onChange={(fit) => update({ fit })} />
          </>
        )}
      </Section>
    </>
  )
}
