import { createContext, useContext } from 'react'
import type { Device, DeviceId, FrameColor } from './devices'

export type StatusBarMode = 'live' | 'fixed' | 'hidden'

/** Everything the Recording tab controls. Remembered per prototype. */
export type StageSettings = {
  framed: boolean
  device: DeviceId | 'custom'
  custom: { width: number; height: number }
  color: FrameColor
  /** Scale the device down to fit short windows; off shows it at real size */
  fit: boolean
  /** Lay the device on its side */
  landscape: boolean
  /** Page color behind the device; null is the default */
  background: string | null
  statusBar: StatusBarMode
  /** Status bar text and icons: dark on light screens, light on dark screens */
  statusBarTone: 'dark' | 'light'
  homeIndicator: boolean
  /** Hide the Debug button too, for clean recordings (` brings it back) */
  hideLauncher: boolean
}

export const defaultSettings: StageSettings = {
  framed: true,
  device: 'iphone-pro',
  custom: { width: 402, height: 874 },
  color: 'black',
  fit: true,
  landscape: false,
  background: null,
  statusBar: 'live',
  statusBarTone: 'dark',
  homeIndicator: true,
  hideLauncher: false,
}

export type Screen = { id: string; label: string; group?: string }

export type SectionInfo = { id: string; tab: string; title?: string; note?: string; order: number; seq: number }
export type ShortcutInfo = { id: string; key: string; label?: string; run: () => void }

export type ProtoContextValue = {
  namespace: string
  settings: StageSettings
  update: (patch: Partial<StageSettings>) => void
  reset: () => void
  /** The device being shown, or null when there is no frame */
  device: Device | null
  /** True on a real phone, where the app fills the screen */
  isPhone: boolean
  /** Size of the app's screen in points (the window size when unframed) */
  screenSize: { width: number; height: number }
  /** The element the app renders into; portal dialogs here to keep them in the phone */
  screenElement: HTMLElement | null
  open: boolean
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void
  unlocked: boolean
  // Registries for DebugSection and useDebugShortcut
  registerSection: (info: SectionInfo) => () => void
  sectionTarget: (id: string) => HTMLElement | null
  registerShortcut: (info: ShortcutInfo) => () => void
}

export const ProtoContext = createContext<ProtoContextValue | null>(null)

export function useProtoContext(name: string) {
  const value = useContext(ProtoContext)
  if (!value) throw new Error(`${name} must be used inside <Prototype>.`)
  return value
}
