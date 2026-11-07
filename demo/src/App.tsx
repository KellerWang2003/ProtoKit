import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ProtoKit, useDebugState, useProto } from 'proto-kit'

// A tiny plant-care app, just to show the kit wrapped around something real.
export function App() {
  const [screen, setScreen] = useDebugState('screen', 'home')
  return (
    <ProtoKit
      name="Pocket Garden"
      unlock={new URLSearchParams(location.search).has("hold") ? "hold" : "always"}
      screenBackground="#f6f4ee"
      caption="Interactive prototype · some features are still in development."
    >
      <Garden screen={screen} go={setScreen} />
    </ProtoKit>
  )
}

const plants = [
  { name: 'Monstera', water: 'Every 7 days', emoji: '🪴', due: 2 },
  { name: 'Pothos', water: 'Every 5 days', emoji: '🌿', due: 0 },
  { name: 'Fiddle leaf', water: 'Every 10 days', emoji: '🌳', due: 6 },
  { name: 'Cactus', water: 'Every 21 days', emoji: '🌵', due: 14 },
]

const accents: Record<string, string> = { green: '#2f7d4f', olive: '#6b7a2f', clay: '#b4583a', sky: '#2f6fa8' }

function Garden({ screen, go }: { screen: string; go: (id: string) => void }) {
  const [empty] = useDebugState('empty', false)
  const [season] = useDebugState('season', 'spring')
  const [streak] = useDebugState('streak', 4)
  const [sheet, setSheet] = useDebugState('sheet', false)
  const [accentKey] = useDebugState('accent', 'green')
  const [selected, setSelected] = useState(0)
  const accent = accents[accentKey]
  const { screenElement } = useProto()
  const list = empty ? [] : plants

  if (screen === 'welcome' || screen === 'pick') {
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 24, gap: 16, background: accent, color: '#fff', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 64 }}>{screen === 'welcome' ? '🌱' : '🪴'}</div>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.05 }}>{screen === 'welcome' ? 'Keep every plant alive.' : 'What are you growing?'}</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Gentle reminders, tuned to the season ({season}).</p>
        <button onClick={() => go(screen === 'welcome' ? 'pick' : 'home')} style={{ border: 0, borderRadius: 16, padding: 16, fontSize: 17, fontWeight: 600, background: '#fff', color: accent }}>
          Continue
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#f6f4ee', color: '#1d1f1a' }}>
      <div style={{ flex: 1, padding: '12px 20px 100px' }}>
        {screen === 'plant' ? (
          <>
            <button onClick={() => go('home')} style={{ border: 0, background: 'none', color: accent, fontSize: 17, padding: 0 }}>‹ Garden</button>
            <div style={{ fontSize: 96, textAlign: 'center', margin: '24px 0' }}>{plants[selected].emoji}</div>
            <h1 style={{ margin: 0 }}>{plants[selected].name}</h1>
            <p style={{ color: '#6b6e64' }}>{plants[selected].water}</p>
            <button onClick={() => setSheet(true)} style={{ width: '100%', border: 0, borderRadius: 16, padding: 16, fontSize: 17, fontWeight: 600, background: accent, color: '#fff' }}>
              Log watering
            </button>
          </>
        ) : (
          <>
            <p style={{ margin: '8px 0 0', color: '#6b6e64', fontSize: 15 }}>Good morning</p>
            <h1 style={{ margin: '2px 0 16px', fontSize: 32 }}>Your garden</h1>
            <div style={{ borderRadius: 20, padding: 16, background: accent, color: '#fff', marginBottom: 16 }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Watering streak</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>🔥 {streak} days</div>
            </div>
            {list.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b6e64', marginTop: 48 }}>No plants yet. Add your first one.</p>
            ) : (
              list.map((plant, i) => (
                <button
                  key={plant.name}
                  onClick={() => {
                    setSelected(i)
                    go('plant')
                  }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, border: 0, borderRadius: 16, padding: 12, marginBottom: 8, background: '#fff', textAlign: 'left', fontSize: 16 }}
                >
                  <span style={{ fontSize: 32 }}>{plant.emoji}</span>
                  <span style={{ flex: 1 }}>
                    <strong>{plant.name}</strong>
                    <br />
                    <span style={{ color: '#6b6e64', fontSize: 13 }}>{plant.due === 0 ? 'Water today' : `In ${plant.due} days`}</span>
                  </span>
                </button>
              ))
            )}
          </>
        )}
      </div>
      {/* position: fixed stays inside the phone */}
      <nav style={{ position: 'fixed', left: 16, right: 16, bottom: 'calc(var(--proto-safe-bottom) + 8px)', display: 'flex', justifyContent: 'space-around', padding: 12, borderRadius: 24, background: 'rgba(255,255,255,.9)', boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
        {['🏡', '📅', '⚙️'].map((icon) => (
          <span key={icon} style={{ fontSize: 22 }}>{icon}</span>
        ))}
      </nav>
      {sheet && screenElement &&
        createPortal(
          <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'flex-end', zIndex: 10 }}>
            <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', borderRadius: '28px 28px 0 0', background: '#fff', padding: '20px 20px calc(var(--proto-safe-bottom, 0px) + 24px)', boxSizing: 'border-box' }}>
              <h2 style={{ margin: '0 0 8px' }}>Watered! 💧</h2>
              <p style={{ color: '#6b6e64', margin: 0 }}>Next watering in 7 days.</p>
            </div>
          </div>,
          screenElement,
        )}
    </div>
  )
}
