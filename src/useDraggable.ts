import { useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { useStored } from './store'

type Position = { x: number; y: number }

// Drag something by a handle and remember where it lands (per key). A press that
// barely moves still counts as a click. With snapToEdge it ends up against the
// closer side of the window, and x becomes the side: 0 left, 1 right.
export function useDraggable(key: string, snapToEdge = false) {
  const [position, setPosition] = useStored<Position | null>(key, null)
  const drag = useRef<{ el: HTMLElement; dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null)
  const last = useRef<Position | null>(position)
  const moved = useRef(false)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const el = event.currentTarget.closest<HTMLElement>('[data-pk-draggable]')
    if (!el || event.button !== 0) return
    // Buttons inside the handle (like close) keep working
    const pressed = (event.target as HTMLElement).closest('button, select, input')
    if (pressed && pressed !== event.currentTarget) return
    const rect = el.getBoundingClientRect()
    drag.current = { el, dx: event.clientX - rect.left, dy: event.clientY - rect.top, startX: event.clientX, startY: event.clientY, moved: false }
    moved.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.hypot(event.clientX - d.startX, event.clientY - d.startY) < 5) return
    d.moved = true
    const next = {
      x: Math.min(Math.max(0, event.clientX - d.dx), Math.max(0, window.innerWidth - d.el.offsetWidth)),
      y: Math.min(Math.max(0, event.clientY - d.dy), Math.max(0, window.innerHeight - d.el.offsetHeight)),
    }
    last.current = next
    // Snapped elements move freely while dragging, then snap on release
    d.el.style.left = `${next.x}px`
    d.el.style.top = `${next.y}px`
    d.el.style.right = 'auto'
    d.el.style.bottom = 'auto'
  }
  const onPointerUp = () => {
    const d = drag.current
    if (!d) return
    moved.current = d.moved
    drag.current = null
    if (!d.moved || !last.current) return
    let next = last.current
    if (snapToEdge) {
      const right = next.x + d.el.offsetWidth / 2 > window.innerWidth / 2
      next = { x: right ? 1 : 0, y: next.y }
    }
    d.el.style.removeProperty('left')
    d.el.style.removeProperty('top')
    d.el.style.removeProperty('right')
    d.el.style.removeProperty('bottom')
    setPosition(next)
  }

  const right = snapToEdge && position?.x === 1
  let style: CSSProperties | undefined
  if (position) {
    // Keep it on screen if the window got smaller since
    const y = Math.min(position.y, Math.max(0, window.innerHeight - 60))
    if (right) style = { right: 0, left: 'auto', top: y, bottom: 'auto' }
    else style = { left: snapToEdge ? 0 : Math.min(position.x, Math.max(0, window.innerWidth - 80)), top: y, right: 'auto', bottom: 'auto' }
  }
  return {
    style,
    side: right ? ('right' as const) : ('left' as const),
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
    /** Read in onClick: true when the press was a drag, not a tap */
    wasDragged: () => moved.current,
    reset: () => setPosition(null),
  }
}
