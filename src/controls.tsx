import { useContext, useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ProtoContext, useProtoContext } from './context'
import { useStored } from './store'
import type { SetValue } from './store'

let sequence = 0

/**
 * A titled group of controls in the debug panel. Render it anywhere inside
 * <Prototype>: it shows up in the panel under `tab` (default "Debug"), and
 * nothing renders where you put it. Sections in the same tab are ordered by
 * `order`, then by when they first mounted.
 */
export function DebugSection({ tab = 'Debug', title, note, order = 0, children }: { tab?: string; title?: string; note?: string; order?: number; children: ReactNode }) {
  const ctx = useContext(ProtoContext)
  const id = useId()
  const seq = useRef(++sequence)
  const register = ctx?.registerSection
  useEffect(() => register?.({ id, tab, title, note, order, seq: seq.current }), [register, id, tab, title, note, order])
  const target = ctx?.sectionTarget(id)
  return target ? createPortal(children, target) : null
}

/**
 * Like useState, but remembered across reloads and shared by every component
 * that uses the same key. Use it for anything a debug control changes.
 */
export function useDebugState<T>(key: string, initial: T): [T, SetValue<T>] {
  const ctx = useContext(ProtoContext)
  return useStored(`${ctx?.namespace ?? 'proto'}:state:${key}`, initial)
}

/**
 * A keyboard shortcut that works while the debug tools are unlocked, listed in
 * the panel's footer. Single keys only ("1", "r", "ArrowUp"); typing in a field
 * never triggers it.
 */
export function useDebugShortcut(key: string, run: () => void, label?: string) {
  const { registerShortcut } = useProtoContext('useDebugShortcut')
  const id = useId()
  const latest = useRef(run)
  useEffect(() => {
    latest.current = run
  })
  useEffect(() => registerShortcut({ id, key, label, run: () => latest.current() }), [registerShortcut, id, key, label])
}

/** The stage's state for app code: which device is showing, its screen size, the settings and more. */
export function useProto() {
  const { settings, update, device, isPhone, screenSize, screenElement, open, setOpen, unlocked } = useProtoContext('useProto')
  return { settings, update, device, isPhone, framed: device !== null, screenSize, screenElement, panelOpen: open, setPanelOpen: setOpen, unlocked }
}

// ───────── Controls ─────────

function Label({ label, hint }: { label: ReactNode; hint?: string }) {
  return (
    <span className="pk-row-label">
      <span>{label}</span>
      {hint && <span className="pk-row-hint">{hint}</span>}
    </span>
  )
}

/** An on/off row. `hint` is a short tag after the label, like a shortcut key. */
export function DebugToggle({ label, value, onChange, hint }: { label: ReactNode; value: boolean; onChange: (value: boolean) => void; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} className="pk-row" onClick={() => onChange(!value)}>
      <Label label={label} hint={hint} />
      <span className="pk-switch" data-on={value ? '' : undefined} />
    </button>
  )
}

export type Option<T> = T | { value: T; label: ReactNode }
function normalize<T>(option: Option<T>): { value: T; label: ReactNode } {
  return typeof option === 'object' && option !== null && 'value' in option ? option : { value: option as T, label: String(option) }
}

/** Two to five mutually exclusive choices as pills. Use DebugSelect for more. */
export function DebugSegmented<T extends string | number | boolean | null>({ label, options, value, onChange }: { label?: ReactNode; options: Option<T>[]; value: T; onChange: (value: T) => void }) {
  const items = options.map(normalize)
  const pills = (
    <div role="radiogroup" className="pk-segmented" data-wrap={items.length > 3 ? '' : undefined}>
      {items.map((item) => (
        <button key={String(item.value)} type="button" role="radio" aria-checked={item.value === value} className="pk-segment" onClick={() => onChange(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
  )
  if (!label) return <div className="pk-row pk-row-stack">{pills}</div>
  return (
    <div className="pk-row pk-row-stack">
      <Label label={label} />
      {pills}
    </div>
  )
}

/** A dropdown. Options can be grouped: { group: 'Onboarding', options: [...] }. */
export function DebugSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label?: ReactNode
  options: (Option<T> | { group: string; options: Option<T>[] })[]
  value: T
  onChange: (value: T) => void
}) {
  const flat: { value: T; label: ReactNode }[] = []
  const renderOption = (option: Option<T>) => {
    const item = normalize(option)
    const index = flat.push(item) - 1
    return (
      <option key={index} value={index}>
        {typeof item.label === 'string' || typeof item.label === 'number' ? item.label : String(item.value)}
      </option>
    )
  }
  const children = options.map((entry, i) =>
    typeof entry === 'object' && entry !== null && 'group' in entry ? (
      <optgroup key={`g${i}`} label={entry.group}>
        {entry.options.map(renderOption)}
      </optgroup>
    ) : (
      renderOption(entry as Option<T>)
    ),
  )
  const selected = flat.findIndex((item) => item.value === value)
  return (
    <label className="pk-row pk-row-stack">
      {label && <Label label={label} />}
      <select className="pk-select" value={selected} onChange={(event) => onChange(flat[Number(event.target.value)].value)}>
        {children}
      </select>
    </label>
  )
}

/** A row of buttons for one-off actions: reset, jump somewhere, fire an event. */
export function DebugButtons({ children }: { children: ReactNode }) {
  return <div className="pk-button-row">{children}</div>
}

export function DebugButton({ children, onClick, variant, pressed }: { children: ReactNode; onClick: () => void; variant?: 'primary' | 'danger'; pressed?: boolean }) {
  return (
    <button type="button" className="pk-btn" data-variant={variant} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  )
}

/** A row that opens or closes something over the app, like a playground. */
export function DebugLink({ label, open, onClick }: { label: ReactNode; open?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="pk-row" onClick={onClick}>
      <span className="pk-row-label" style={{ fontWeight: open ? 600 : undefined }}>
        {label}
      </span>
      <span className="pk-row-hint">{open ? 'Close ×' : 'Open →'}</span>
    </button>
  )
}

export function DebugNumber({ label, value, onChange, min, max, step, unit }: { label: ReactNode; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; unit?: string }) {
  return (
    <label className="pk-row">
      <Label label={label} hint={unit} />
      <input className="pk-input" style={{ width: 84 }} type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export function DebugSlider({ label, value, onChange, min = 0, max = 1, step = 0.01, format }: { label: ReactNode; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; format?: (value: number) => string }) {
  return (
    <label className="pk-row pk-row-stack">
      <span className="pk-row-label" style={{ justifyContent: 'space-between', width: '100%' }}>
        <span>{label}</span>
        <span className="pk-row-hint" style={{ fontVariantNumeric: 'tabular-nums' }}>{format ? format(value) : value}</span>
      </span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} style={{ width: '100%', accentColor: 'var(--pk-accent)' }} />
    </label>
  )
}

export function DebugText({ label, value, onChange, placeholder }: { label: ReactNode; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="pk-row pk-row-stack">
      <Label label={label} />
      <input className="pk-input" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function DebugColor({ label, value, onChange }: { label: ReactNode; value: string; onChange: (value: string) => void }) {
  return (
    <label className="pk-row">
      <Label label={label} />
      <input className="pk-color" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

/** A read-only line, for showing live state ("Score: 12"). */
export function DebugValue({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="pk-row">
      <Label label={label} />
      <span className="pk-row-hint" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--pk-ink)' }}>{children}</span>
    </div>
  )
}
