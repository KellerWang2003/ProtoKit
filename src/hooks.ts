import { useContext } from 'react'
import { ProtoContext, useProtoContext } from './context'
import { useStored } from './store'
import type { SetValue } from './store'

/**
 * Like useState, but remembered across reloads and shared by every component
 * that uses the same key. Handy for demo state that DialKit actions change.
 */
export function useDebugState<T>(key: string, initial: T): [T, SetValue<T>] {
  const ctx = useContext(ProtoContext)
  return useStored(`${ctx?.namespace ?? 'proto'}:state:${key}`, initial)
}

/** The stage's state for app code: which device is showing, its screen size, the settings and more. */
export function useProto() {
  const { settings, update, device, isPhone, screenSize, screenElement, open, unlocked } = useProtoContext('useProto')
  return { settings, update, device, isPhone, framed: device !== null, screenSize, screenElement, panelOpen: open, unlocked }
}
