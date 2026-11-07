import { useEffect, useMemo, useRef } from 'react'
import { useDialKitController } from 'dialkit'
import { customLimits, deviceList, frameColors } from './devices'
import type { FrameColor } from './devices'
import type { Screen, StageSettings } from './context'

type Props = {
  settings: StageSettings
  update: (patch: Partial<StageSettings>) => void
  screens?: Screen[]
  screen?: string
  onScreenChange?: (id: string) => void
}

const deviceOptions = [...deviceList.map((device) => ({ value: device.id, label: device.label })), { value: 'custom', label: 'Custom size' }]
const finishOptions = (Object.keys(frameColors) as FrameColor[]).map((key) => ({ value: key, label: frameColors[key].label }))

type Values = {
  frame: boolean
  device: string
  finish: string
  landscape: boolean
  fit: boolean
  size: { width: number; height: number }
  screen?: string
}

/**
 * The device settings as a DialKit panel. ProtoKit's own store stays the source
 * of truth (it's remembered and the F key changes it); the panel mirrors it both ways.
 */
export function DevicePanel({ settings, update, screens, screen, onScreenChange }: Props) {
  const hasScreens = !!screens?.length && !!onScreenChange
  // Built once: DialKit reads defaults from the first config
  const config = useMemo(
    () => ({
      ...(hasScreens ? { screen: { type: 'select' as const, options: screens!.map((item) => ({ value: item.id, label: item.group ? `${item.group} · ${item.label}` : item.label })), default: screen ?? screens![0].id } } : {}),
      frame: settings.framed,
      device: { type: 'select' as const, options: deviceOptions, default: settings.device },
      finish: { type: 'select' as const, options: finishOptions, default: settings.color },
      landscape: settings.landscape,
      fit: settings.fit,
      size: {
        width: [settings.custom.width, customLimits.min, customLimits.max, 1] as [number, number, number, number],
        height: [settings.custom.height, customLimits.min, customLimits.max, 1] as [number, number, number, number],
        _collapsed: settings.device !== 'custom',
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasScreens],
  )
  const dial = useDialKitController('Device', config)
  const values = dial.values as unknown as Values

  // Panel → store
  const latest = useRef({ settings, update, screen, onScreenChange })
  latest.current = { settings, update, screen, onScreenChange }
  useEffect(() => {
    const { settings, update, screen, onScreenChange } = latest.current
    const patch: Partial<StageSettings> = {}
    if (values.frame !== settings.framed) patch.framed = values.frame
    if (values.device !== settings.device) patch.device = values.device as StageSettings['device']
    if (values.finish !== settings.color) patch.color = values.finish as FrameColor
    if (values.landscape !== settings.landscape) patch.landscape = values.landscape
    if (values.fit !== settings.fit) patch.fit = values.fit
    if (values.size.width !== settings.custom.width || values.size.height !== settings.custom.height) patch.custom = { width: values.size.width, height: values.size.height }
    if (Object.keys(patch).length) update(patch)
    if (values.screen !== undefined && values.screen !== screen) onScreenChange?.(values.screen)
  }, [values.frame, values.device, values.finish, values.landscape, values.fit, values.size.width, values.size.height, values.screen])

  // Store → panel (F key, arrow keys, reset, other tabs)
  useEffect(() => {
    const current = dial.getValues() as unknown as Values
    const next: Record<string, unknown> = {}
    if (current.frame !== settings.framed) next.frame = settings.framed
    if (current.device !== settings.device) next.device = settings.device
    if (current.finish !== settings.color) next.finish = settings.color
    if (current.landscape !== settings.landscape) next.landscape = settings.landscape
    if (current.fit !== settings.fit) next.fit = settings.fit
    if (current.size.width !== settings.custom.width || current.size.height !== settings.custom.height) next.size = { ...settings.custom }
    if (hasScreens && screen !== undefined && current.screen !== screen) next.screen = screen
    if (Object.keys(next).length) dial.setValues(next as never)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.framed, settings.device, settings.color, settings.landscape, settings.fit, settings.custom.width, settings.custom.height, screen])

  return null
}
