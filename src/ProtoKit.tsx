import { useCallback, useEffect, useInsertionEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { BAND, devices, frameColors } from './devices'
import type { Device } from './devices'
import { ProtoContext, defaultSettings } from './context'
import type { ProtoContextValue, Screen, SectionInfo, ShortcutInfo, StageSettings } from './context'
import { DebugPanel } from './DebugPanel'
import { StatusBar } from './StatusBar'
import { clearStored, useStored } from './store'
import { css } from './styles'

export type ProtoKitProps = {
  children: ReactNode
  /** Shown in the panel's title, and used to keep this prototype's settings apart from others on the same origin */
  name?: string
  /** Where settings are remembered. Defaults to one derived from `name`. */
  storageKey?: string
  /** Starting settings, before anything is changed in the panel (e.g. { device: 'pixel' }) */
  defaults?: Partial<StageSettings>
  /**
   * 'always': the Debug button is always there (good for local work).
   * 'hold': hidden until you press and hold one spot for 4 seconds, or open the
   * page with ?debug — so reviewers of a shared link never see it.
   */
  unlock?: 'always' | 'hold'
  /** Optional list of screens: adds a screen picker to the panel and ← → to step through them */
  screens?: Screen[]
  screen?: string
  onScreenChange?: (id: string) => void
  /**
   * 'inset' (default): the app starts below the status bar and above the home
   * indicator, so nothing gets covered. 'overlay': the app runs edge to edge
   * under them; pad with var(--proto-safe-top) etc. yourself.
   */
  safeArea?: 'inset' | 'overlay'
  /** Color of the screen behind the app (shows in the safe areas in inset mode) */
  screenBackground?: string
  /** Page color behind the device */
  backdrop?: string
  /** Panel theme */
  theme?: 'light' | 'dark' | 'auto'
  /** A line under the device, e.g. "Interactive prototype — some features are in development." */
  caption?: ReactNode
  /** Show the panel open on first load */
  defaultOpen?: boolean
}

const HOLD_MS = 4000
const HOLD_SLOP = 10
const PHONE_QUERY = '(max-width: 500px) and (pointer: coarse)'

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'proto'
}

function useMedia(query: string) {
  return useSyncExternalStore(
    useCallback(
      (onChange: () => void) => {
        const media = window.matchMedia(query)
        media.addEventListener('change', onChange)
        return () => media.removeEventListener('change', onChange)
      },
      [query],
    ),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

let injected = false
function useStyles() {
  useInsertionEffect(() => {
    if (injected || document.querySelector('style[data-proto-kit]')) return
    injected = true
    const style = document.createElement('style')
    style.setAttribute('data-proto-kit', '')
    style.textContent = css
    document.head.appendChild(style)
  }, [])
}

function isDark(color: string) {
  const hex = color.trim().replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(hex)) return false
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45
}

function readSessionUnlock(key: string) {
  try {
    if (new URLSearchParams(window.location.search).has('debug')) return true
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

type Insets = { top: number; right: number; bottom: number; left: number }

/** Geometry of the device as shown: rotated for landscape */
function layout(device: Device, landscape: boolean) {
  const [t, r, b, l] = device.bezel
  // Turned counterclockwise: the top (island) ends up on the left
  const bezel = landscape ? { top: r, right: b, bottom: l, left: t } : { top: t, right: r, bottom: b, left: l }
  const width = landscape ? device.height : device.width
  const height = landscape ? device.width : device.height
  let safe: Insets
  if (!landscape) safe = { top: device.statusBar, right: 0, bottom: device.bottomInset, left: 0 }
  else if (device.kind === 'tablet') safe = { top: device.statusBar, right: 0, bottom: device.bottomInset, left: 0 }
  else if (device.cutout === 'none') safe = { top: 0, right: 0, bottom: 0, left: 0 }
  else safe = { top: 0, right: device.statusBar, bottom: device.bottomInset ? 21 : 0, left: device.statusBar }
  const outerWidth = width + bezel.left + bezel.right + BAND * 2
  const outerHeight = height + bezel.top + bezel.bottom + BAND * 2
  const outerRadius = device.homeButton ? 56 : device.radius + t + BAND
  return { bezel, width, height, safe, outerWidth, outerHeight, outerRadius }
}

/** Hardware buttons along the band, in portrait coordinates, turned with the device */
function sideButtons(device: Device, landscape: boolean, portraitHeight: number) {
  const H = portraitHeight
  const specs: { side: 'left' | 'right'; at: number; length: number }[] =
    device.kind === 'tablet'
      ? [
          { side: 'right', at: 0.08, length: 44 },
          { side: 'right', at: 0.14, length: 44 },
        ]
      : device.os === 'android'
        ? [
            { side: 'right', at: 0.2, length: 60 },
            { side: 'right', at: 0.32, length: 100 },
          ]
        : [
            { side: 'left', at: 0.17, length: 32 },
            { side: 'left', at: 0.25, length: 60 },
            { side: 'left', at: 0.33, length: 60 },
            { side: 'right', at: 0.28, length: 96 },
          ]
  return specs.map((spec, i) => {
    const offset = spec.at * H
    if (!landscape) return <span key={i} className="pk-button" data-side={spec.side} style={{ top: offset, height: spec.length }} />
    // Counterclockwise: the left edge becomes the bottom, the right edge the top
    const edge: CSSProperties = spec.side === 'left' ? { bottom: -3, borderRadius: '0 0 2px 2px' } : { top: -3, borderRadius: '2px 2px 0 0' }
    return <span key={i} className="pk-button" style={{ ...edge, left: offset, width: spec.length, height: 4, background: 'linear-gradient(180deg, var(--pk-band-dark), var(--pk-band-light), var(--pk-band-dark))' }} />
  })
}

/**
 * Wrap your app in this. It draws the device frame (or fills the window), adds
 * the debug panel with its Recording tab, and gives every DebugSection inside
 * a place in the panel.
 */
export function ProtoKit({
  children,
  name,
  storageKey,
  defaults,
  unlock = 'always',
  screens,
  screen,
  onScreenChange,
  safeArea = 'inset',
  screenBackground = '#ffffff',
  backdrop = '#ececea',
  theme = 'auto',
  caption,
  defaultOpen = false,
}: ProtoKitProps) {
  useStyles()
  const namespace = storageKey ?? `proto:${slug(name ?? 'app')}`
  const initial = useMemo(() => ({ ...defaultSettings, ...defaults }), [defaults])
  const [stored, setStored] = useStored<Partial<StageSettings>>(`${namespace}:settings`, {})
  const settings: StageSettings = { ...initial, ...stored }
  const update = useCallback((patch: Partial<StageSettings>) => setStored((current) => ({ ...current, ...patch })), [setStored])
  const reset = useCallback(() => clearStored(`${namespace}:`), [namespace])

  const isPhone = useMedia(PHONE_QUERY)
  const wide = useMedia('(min-width: 900px)')
  const prefersDark = useMedia('(prefers-color-scheme: dark)')
  const panelTheme = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme

  // ── Unlock and open ──
  const unlockKey = `${namespace}:unlocked`
  const [unlocked, setUnlocked] = useState(() => unlock === 'always' || readSessionUnlock(unlockKey))
  const [open, setOpenState] = useState(() => defaultOpen && (unlock === 'always' || readSessionUnlock(unlockKey)))
  const setOpen = useCallback((next: boolean | ((open: boolean) => boolean)) => setOpenState(next), [])
  useEffect(() => {
    if (unlock === 'always') setUnlocked(true)
  }, [unlock])

  // Press and hold one spot for 4 seconds to reveal the Debug button
  useEffect(() => {
    if (unlocked) return
    let timer = 0
    let start: { x: number; y: number; id: number } | null = null
    const cancel = () => {
      window.clearTimeout(timer)
      start = null
    }
    // The press that revealed it shouldn't also tap whatever is under it
    const swallowClick = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
    }
    const onDown = (event: PointerEvent) => {
      cancel()
      if (!event.isPrimary) return
      start = { x: event.clientX, y: event.clientY, id: event.pointerId }
      timer = window.setTimeout(() => {
        start = null
        setUnlocked(true)
        try {
          sessionStorage.setItem(unlockKey, '1')
        } catch {
          // Until refresh only.
        }
        window.addEventListener('click', swallowClick, { capture: true, once: true })
        window.setTimeout(() => window.removeEventListener('click', swallowClick, { capture: true }), 600)
      }, HOLD_MS)
    }
    const onMove = (event: PointerEvent) => {
      if (start && event.pointerId === start.id && Math.hypot(event.clientX - start.x, event.clientY - start.y) > HOLD_SLOP) cancel()
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', cancel, true)
    window.addEventListener('pointercancel', cancel, true)
    return () => {
      cancel()
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', cancel, true)
      window.removeEventListener('pointercancel', cancel, true)
    }
  }, [unlocked, unlockKey])

  // ── Registries ──
  const [sections, setSections] = useState<SectionInfo[]>([])
  const registerSection = useCallback((info: SectionInfo) => {
    setSections((current) => [...current.filter((section) => section.id !== info.id), info].sort((a, b) => a.order - b.order || a.seq - b.seq))
    return () => setSections((current) => current.filter((section) => section.id !== info.id))
  }, [])
  const [targets, setTargets] = useState<Record<string, HTMLElement>>({})
  const setTarget = useCallback((id: string, element: HTMLElement | null) => {
    setTargets((current) => {
      if ((current[id] ?? null) === element) return current
      const next = { ...current }
      if (element) next[id] = element
      else delete next[id]
      return next
    })
  }, [])
  const sectionTarget = useCallback((id: string) => targets[id] ?? null, [targets])

  const shortcutsRef = useRef<ShortcutInfo[]>([])
  const [shortcuts, setShortcuts] = useState<ShortcutInfo[]>([])
  const registerShortcut = useCallback((info: ShortcutInfo) => {
    shortcutsRef.current = [...shortcutsRef.current.filter((item) => item.id !== info.id), info]
    setShortcuts(shortcutsRef.current)
    return () => {
      shortcutsRef.current = shortcutsRef.current.filter((item) => item.id !== info.id)
      setShortcuts(shortcutsRef.current)
    }
  }, [])

  // ── Keyboard ──
  const latest = useRef({ settings, update, screens, screen, onScreenChange, unlocked })
  latest.current = { settings, update, screens, screen, onScreenChange, unlocked }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const { settings, update, screens, screen, onScreenChange, unlocked } = latest.current
      if (!unlocked) return
      const target = event.target as HTMLElement | null
      if (target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key
      if (key === '`') {
        event.preventDefault()
        setOpenState((value) => !value)
      } else if (key === 'Escape') setOpenState(false)
      else if (key === 'f' || key === 'F') update({ framed: !settings.framed })
      else if ((key === 'ArrowRight' || key === 'ArrowLeft') && screens?.length && onScreenChange) {
        const index = screens.findIndex((item) => item.id === screen)
        const next = Math.min(screens.length - 1, Math.max(0, index + (key === 'ArrowRight' ? 1 : -1)))
        if (next !== index) onScreenChange(screens[next].id)
      } else {
        const shortcut = shortcutsRef.current.find((item) => item.key === key || item.key.toLowerCase() === key.toLowerCase())
        if (shortcut) shortcut.run()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Geometry ──
  const fill = isPhone || !settings.framed
  const custom = !fill && settings.device === 'custom'
  const device: Device | null = fill || custom ? null : (devices[settings.device as keyof typeof devices] ?? devices['iphone-pro'])
  const geometry = device ? layout(device, settings.landscape) : null
  const mode = fill ? 'fill' : custom ? 'box' : 'device'
  const outer = geometry ? { width: geometry.outerWidth, height: geometry.outerHeight } : custom ? settings.custom : null

  const area = useRef<HTMLDivElement>(null)
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const element = area.current
    if (!element) return
    const measure = () => {
      const style = getComputedStyle(element)
      setAreaSize({
        width: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        height: element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const pad = 32
  const scale = outer && settings.fit && areaSize.width > 0 ? Math.max(0.05, Math.min(1, (areaSize.width - pad * 2) / outer.width, (areaSize.height - pad * 2) / outer.height)) : 1

  const screenSize = geometry ? { width: geometry.width, height: geometry.height } : custom ? settings.custom : areaSize
  const safe: Insets | null = geometry ? geometry.safe : custom ? { top: 0, right: 0, bottom: 0, left: 0 } : null
  const [screenElement, setScreenElement] = useState<HTMLElement | null>(null)

  const background = settings.background ?? backdrop
  const band = frameColors[settings.color].band
  const stageStyle = {
    '--pk-backdrop': background,
    '--pk-band': `${BAND}px`,
    '--pk-band-light': band[0],
    '--pk-band-base': band[1],
    '--pk-band-dark': band[2],
    '--pk-outer-radius': geometry ? `${geometry.outerRadius}px` : undefined,
    '--pk-screen-radius': device ? `${device.radius}px` : undefined,
    '--pk-bezel': geometry ? `${geometry.bezel.top}px ${geometry.bezel.right}px ${geometry.bezel.bottom}px ${geometry.bezel.left}px` : undefined,
    '--pk-bezel-top': geometry ? `${geometry.bezel.top}px` : undefined,
    '--pk-bezel-bottom': geometry ? `${geometry.bezel.bottom}px` : undefined,
    '--pk-screen-bg': screenBackground,
  } as CSSProperties

  // On the screen, so dialogs portaled into it see the same variables
  const screenVars = {
    '--proto-safe-top': safe ? `${safe.top}px` : 'env(safe-area-inset-top, 0px)',
    '--proto-safe-right': safe ? `${safe.right}px` : 'env(safe-area-inset-right, 0px)',
    '--proto-safe-bottom': safe ? `${safe.bottom}px` : 'env(safe-area-inset-bottom, 0px)',
    '--proto-safe-left': safe ? `${safe.left}px` : 'env(safe-area-inset-left, 0px)',
    '--proto-screen-width': `${screenSize.width}px`,
    '--proto-screen-height': `${screenSize.height}px`,
  } as CSSProperties
  const appStyle = {
    paddingLeft: safeArea === 'inset' ? 'var(--proto-safe-left)' : undefined,
    paddingRight: safeArea === 'inset' ? 'var(--proto-safe-right)' : undefined,
  } as CSSProperties

  const landscapePhone = !!device && settings.landscape && device.kind === 'phone'
  const showStatusBar = !!device && settings.statusBar !== 'hidden' && !landscapePhone
  const tone = settings.statusBarTone
  const cutoutStyle: CSSProperties | undefined = settings.landscape ? { top: '50%', left: 11, transform: 'translateY(-50%)', width: device?.cutout === 'island' ? 36 : 14, height: device?.cutout === 'island' ? 124 : 14 } : undefined

  const context: ProtoContextValue = {
    namespace,
    settings,
    update,
    reset,
    device,
    isPhone,
    screenSize,
    screenElement,
    open,
    setOpen,
    unlocked,
    registerSection,
    sectionTarget,
    registerShortcut,
  }

  return (
    <ProtoContext.Provider value={context}>
      <div className="pk-stage" data-mode={mode} data-dark={isDark(background) ? '' : undefined} data-scroll={outer && !settings.fit ? '' : undefined} data-panel={outer && unlocked && open && wide && !isPhone ? '' : undefined} style={stageStyle}>
        <div className="pk-area" ref={area}>
          <div className="pk-fit" style={outer ? { width: outer.width * scale, height: outer.height * scale } : undefined}>
            <div className="pk-device" style={outer ? { width: outer.width, height: outer.height, transform: `scale(${scale})` } : undefined}>
              {device && geometry ? sideButtons(device, settings.landscape, device.height + device.bezel[0] + device.bezel[2] + BAND * 2) : null}
              <div className="pk-bezel">
                {device?.homeButton && !settings.landscape ? <span className="pk-speaker" /> : null}
                {device?.homeButton ? (
                  <span
                    className="pk-home-button"
                    style={settings.landscape && geometry ? { left: 'auto', bottom: 'auto', top: '50%', right: (geometry.bezel.right - 56) / 2, transform: 'translateY(-50%)' } : undefined}
                  />
                ) : null}
                <div className="pk-screen" ref={setScreenElement} style={screenVars}>
                  {showStatusBar && device ? <StatusBar device={device} width={screenSize.width} live={settings.statusBar === 'live'} tone={tone} /> : null}
                  <div className="pk-app" data-safe={safeArea} style={appStyle}>
                    {children}
                  </div>
                  {device?.cutout === 'island' ? <span className="pk-island" style={cutoutStyle} /> : null}
                  {device?.cutout === 'punch' ? <span className="pk-punch" style={cutoutStyle} /> : null}
                  {device && device.bottomInset > 0 && settings.homeIndicator ? <span className="pk-home-indicator" data-tone={tone} data-os={device.os} /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        {caption && !fill ? <p className="pk-caption">{caption}</p> : null}
      </div>
      {unlocked && (
        <DebugPanel
          namespace={namespace}
          name={name}
          theme={panelTheme}
          isPhone={isPhone}
          open={open}
          setOpen={setOpen}
          showLauncher={!settings.hideLauncher}
          settings={settings}
          update={update}
          reset={reset}
          sections={sections}
          setTarget={setTarget}
          shortcuts={shortcuts}
          screens={screens}
          screen={screen}
          onScreenChange={onScreenChange}
          defaultBackdrop={backdrop}
        />
      )}
    </ProtoContext.Provider>
  )
}
