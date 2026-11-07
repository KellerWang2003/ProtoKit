import { useCallback, useSyncExternalStore } from 'react'

// A tiny shared store backed by localStorage. Every value lives under one key,
// and every component that reads the same key sees the same value. Storage can
// be missing (private windows, blocked site data), so it always falls back to
// memory.

type Listener = () => void
const values = new Map<string, unknown>()
const listeners = new Map<string, Set<Listener>>()

export function readStored<T>(key: string, initial: T): T {
  if (!values.has(key)) {
    let value: unknown = initial
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) value = JSON.parse(raw)
    } catch {
      // Unreadable: keep the initial value.
    }
    values.set(key, value)
  }
  return values.get(key) as T
}

export function writeStored<T>(key: string, value: T) {
  values.set(key, value)
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Kept in memory only.
  }
  listeners.get(key)?.forEach((listener) => listener())
}

export function clearStored(prefix: string) {
  const keys = new Set<string>(values.keys())
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.add(key)
    }
  } catch {
    // Only memory is cleared.
  }
  for (const key of keys) {
    if (!key.startsWith(prefix)) continue
    values.delete(key)
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    listeners.get(key)?.forEach((listener) => listener())
  }
}

function subscribe(key: string, listener: Listener) {
  let set = listeners.get(key)
  if (!set) listeners.set(key, (set = new Set()))
  set.add(listener)
  return () => {
    set.delete(listener)
  }
}

export type SetValue<T> = (next: T | ((current: T) => T)) => void

export function useStored<T>(key: string, initial: T): [T, SetValue<T>] {
  const value = useSyncExternalStore(
    useCallback((listener: Listener) => subscribe(key, listener), [key]),
    () => readStored(key, initial),
    () => initial,
  )
  const set = useCallback<SetValue<T>>(
    (next) => {
      const current = readStored(key, initial)
      writeStored(key, typeof next === 'function' ? (next as (current: T) => T)(current) : next)
    },
    // initial is only a fallback; a new object each render must not change the setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
  return [value, set]
}
