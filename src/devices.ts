// Device specs, in CSS points (what the browser calls px on that device).
// Bezels are drawn in CSS, so they scale crisply and need no image assets.

export type Cutout = 'island' | 'punch' | 'none'
export type DeviceId = 'iphone-pro' | 'iphone-pro-max' | 'iphone-se' | 'pixel' | 'ipad-mini'

export type Device = {
  id: DeviceId
  label: string
  kind: 'phone' | 'tablet'
  os: 'ios' | 'android'
  /** Screen size in points */
  width: number
  height: number
  /** Screen corner radius */
  radius: number
  /** Black glass border around the screen: [top, right, bottom, left] */
  bezel: [number, number, number, number]
  cutout: Cutout
  /** Height of the status bar area (the top safe area) */
  statusBar: number
  /** Bottom safe area: the home indicator / gesture bar zone */
  bottomInset: number
  homeButton?: boolean
}

export const devices: Record<DeviceId, Device> = {
  'iphone-pro': {
    id: 'iphone-pro',
    label: 'iPhone Pro',
    kind: 'phone',
    os: 'ios',
    width: 402,
    height: 874,
    radius: 56,
    bezel: [12, 12, 12, 12],
    cutout: 'island',
    statusBar: 54,
    bottomInset: 34,
  },
  'iphone-pro-max': {
    id: 'iphone-pro-max',
    label: 'iPhone Pro Max',
    kind: 'phone',
    os: 'ios',
    width: 440,
    height: 956,
    radius: 60,
    bezel: [12, 12, 12, 12],
    cutout: 'island',
    statusBar: 54,
    bottomInset: 34,
  },
  'iphone-se': {
    id: 'iphone-se',
    label: 'iPhone SE',
    kind: 'phone',
    os: 'ios',
    width: 375,
    height: 667,
    radius: 0,
    bezel: [96, 20, 96, 20],
    cutout: 'none',
    statusBar: 20,
    bottomInset: 0,
    homeButton: true,
  },
  pixel: {
    id: 'pixel',
    label: 'Pixel',
    kind: 'phone',
    os: 'android',
    width: 412,
    height: 915,
    radius: 44,
    bezel: [11, 11, 11, 11],
    cutout: 'punch',
    statusBar: 40,
    bottomInset: 24,
  },
  'ipad-mini': {
    id: 'ipad-mini',
    label: 'iPad mini',
    kind: 'tablet',
    os: 'ios',
    width: 744,
    height: 1133,
    radius: 22,
    bezel: [22, 22, 22, 22],
    cutout: 'none',
    statusBar: 24,
    bottomInset: 20,
  },
}

export const deviceList = Object.values(devices)

export type FrameColor = 'black' | 'silver' | 'natural' | 'blue'

/** The metal band's colors: [light edge, base, dark edge] */
export const frameColors: Record<FrameColor, { label: string; band: [string, string, string] }> = {
  black: { label: 'Black', band: ['#5b5b5f', '#2a2a2d', '#151517'] },
  silver: { label: 'Silver', band: ['#f4f4f2', '#d4d4d1', '#a9a9a6'] },
  natural: { label: 'Natural', band: ['#d8d2c6', '#b3ab9d', '#857e72'] },
  blue: { label: 'Blue', band: ['#6f7f93', '#3f4d60', '#26303d'] },
}

/** Width of the metal band around the black bezel */
export const BAND = 4

export const customLimits = { min: 240, max: 2400 }
export const customPresets: { label: string; width: number; height: number }[] = [
  { label: 'Phone', width: 402, height: 874 },
  { label: 'Tablet', width: 820, height: 1180 },
  { label: 'Laptop', width: 1280, height: 800 },
  { label: 'Desktop', width: 1440, height: 900 },
]
