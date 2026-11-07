import { useEffect, useState } from 'react'
import type { Device } from './devices'

// "9:41" style: 12-hour without AM/PM, like the iPhone. Android shows 24-hour-ish
// "9:41" too, which reads fine in recordings.
function formatTime(date: Date) {
  const hours = date.getHours() % 12 || 12
  return `${hours}:${String(date.getMinutes()).padStart(2, '0')}`
}

function useClock(live: boolean) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!live) return
    let interval = 0
    // Tick on the minute, then every minute after
    const timeout = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [live])
  return live ? formatTime(now) : '9:41'
}

function Signal() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
      <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
      <rect x="4.8" y="5.2" width="3.2" height="6.8" rx="1" />
      <rect x="9.6" y="2.6" width="3.2" height="9.4" rx="1" />
      <rect x="14.4" y="0" width="3.2" height="12" rx="1" />
    </svg>
  )
}

function Wifi() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M1.4 4.3a9.4 9.4 0 0 1 13.2 0" />
      <path d="M4.2 7.1a5.4 5.4 0 0 1 7.6 0" />
      <circle cx="8" cy="10.2" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Battery({ android }: { android?: boolean }) {
  if (android) {
    return (
      <svg width="9" height="15" viewBox="0 0 9 15" fill="currentColor" aria-hidden>
        <rect x="2.5" y="0" width="4" height="2" rx=".5" />
        <rect x="0" y="1.5" width="9" height="13.5" rx="1.5" />
      </svg>
    )
  }
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
      <rect x=".5" y=".5" width="23" height="12" rx="3.8" stroke="currentColor" strokeOpacity=".4" />
      <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
      <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" fillOpacity=".45" />
    </svg>
  )
}

/** Wide enough to read as a status bar; tablets put the time at the far left */
export function StatusBar({ device, width, live, tone }: { device: Device; width: number; live: boolean; tone: 'dark' | 'light' }) {
  const time = useClock(live)
  const android = device.os === 'android'
  const height = device.statusBar
  // iOS with an island: time and icons are centered in the "ears" either side of it
  const island = device.cutout === 'island'
  const ear = (width - 124) / 2
  const timeStyle = island
    ? { left: 0, width: ear, top: 0, height: height + 2 }
    : { left: android ? 20 : device.kind === 'tablet' ? 20 : 12, top: 0, height }
  const iconStyle = island
    ? { right: 0, width: ear, top: 0, height: height + 2, justifyContent: 'center' as const }
    : { right: android ? 20 : device.kind === 'tablet' ? 20 : 8, top: 0, height }
  const small = device.statusBar <= 24
  return (
    <div
      className="pk-status"
      data-overlay=""
      data-tone={tone}
      data-os={device.os}
      style={{ height, fontSize: small && !android ? 12 : undefined }}
      aria-hidden
    >
      <span className="pk-status-time" style={timeStyle}>
        {time}
      </span>
      <span className="pk-status-icons" style={{ ...iconStyle, transform: small ? 'scale(.8)' : undefined, transformOrigin: 'right center' }}>
        <Signal />
        <Wifi />
        <Battery android={android} />
      </span>
    </div>
  )
}
