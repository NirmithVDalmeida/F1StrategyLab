import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as setupsApi from '../api/setups.js'

const DEFAULT_CAR_CONFIG = {
  // Aerodynamics (0–100)
  frontWing:       50,
  rearWing:        50,
  floorRideHeight: 50,
  drsDelta:        50,
  // Power Unit (0–100)
  iceOutput:       50,
  ersRate:         50,
  batteryCapacity: 50,
  // Suspension (0–100)
  frontSuspension: 50,
  weightDist:      50,
}

const DEFAULT_STRATEGY = {
  id:    's1',
  label: '1-Stop',
  stints: [
    { id: 'st1', compound: 'Medium', laps: 30 },
    { id: 'st2', compound: 'Hard',   laps: 27 },
  ],
}

/* ── Helper: convert MongoDB doc (PascalCase) to frontend (camelCase) ── */
function normalizeConfig(c) {
  if (!c) return { ...DEFAULT_CAR_CONFIG }
  // Handle both camelCase (localStorage) and PascalCase (MongoDB)
  return {
    frontWing:       c.frontWing       ?? c.FrontWing       ?? 50,
    rearWing:        c.rearWing        ?? c.RearWing        ?? 50,
    floorRideHeight: c.floorRideHeight ?? c.FloorRideHeight ?? 50,
    drsDelta:        c.drsDelta        ?? c.DrsDelta        ?? 50,
    iceOutput:       c.iceOutput       ?? c.IceOutput       ?? 50,
    ersRate:         c.ersRate         ?? c.ErsRate         ?? 50,
    batteryCapacity: c.batteryCapacity ?? c.BatteryCapacity ?? 50,
    frontSuspension: c.frontSuspension ?? c.FrontSuspension ?? 50,
    weightDist:      c.weightDist      ?? c.WeightDist      ?? 50,
  }
}

function normalizeSetup(doc) {
  return {
    id:     doc.id ?? doc.Id ?? doc._id,
    name:   doc.name ?? doc.Name,
    config: normalizeConfig(doc.config ?? doc.Config),
  }
}

function normalizeStint(st) {
  return {
    id:       st.id ?? st.Id,
    compound: st.compound ?? st.Compound,
    laps:     st.laps ?? st.Laps ?? 15,
  }
}

function normalizeStrategy(doc) {
  return {
    id:     doc.id ?? doc.Id ?? doc._id,
    label:  doc.label ?? doc.Label,
    stints: (doc.stints ?? doc.Stints ?? []).map(normalizeStint),
  }
}

/* ── Convert camelCase config to PascalCase for C# API ── */
function toPascalConfig(c) {
  return {
    FrontWing:       c.frontWing,
    RearWing:        c.rearWing,
    FloorRideHeight: c.floorRideHeight,
    DrsDelta:        c.drsDelta,
    IceOutput:       c.iceOutput,
    ErsRate:         c.ersRate,
    BatteryCapacity: c.batteryCapacity,
    FrontSuspension: c.frontSuspension,
    WeightDist:      c.weightDist,
  }
}

export const useAppStore = create(
  persist(
    (set, get) => ({

      // ── Theme ──────────────────────────────────────────────────────────
      isDark: true,
      toggleTheme() {
        const next = !get().isDark
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('f1-theme', next ? 'dark' : 'light')
        set({ isDark: next })
      },

      // ── Circuit Selection ───────────────────────────────────────────────
      selectedCircuitId: 'australia',
      setSelectedCircuitId: (id) => set({ selectedCircuitId: id }),

      // ── Calendar UI ─────────────────────────────────────────────────────
      calendarExpandedId: null,
      setCalendarExpandedId: (id) =>
        set((s) => ({ calendarExpandedId: s.calendarExpandedId === id ? null : id })),

      // ── Car Builder ─────────────────────────────────────────────────────
      carConfig: { ...DEFAULT_CAR_CONFIG },
      setCarConfigValue: (key, value) =>
        set((s) => ({ carConfig: { ...s.carConfig, [key]: value } })),
      resetCarConfig: () => set({ carConfig: { ...DEFAULT_CAR_CONFIG } }),

      // ── Saved Configs (MongoDB-backed) ─────────────────────────────────
      savedConfigs: [],
      _setupsSynced: false,

      async fetchSavedConfigs() {
        try {
          const docs = await setupsApi.fetchSavedSetups()
          set({ savedConfigs: docs.map(normalizeSetup), _setupsSynced: true })
        } catch {
          // MongoDB unavailable — fall back to localStorage data
          console.warn('MongoDB unavailable, using localStorage setups')
        }
      },

      async saveCurrentConfig(name) {
        const { carConfig, savedConfigs } = get()
        try {
          const doc = await setupsApi.createSetup(name, toPascalConfig(carConfig))
          set({ savedConfigs: [...savedConfigs, normalizeSetup(doc)] })
        } catch {
          // Fallback: save locally only
          set({
            savedConfigs: [
              ...savedConfigs.filter((c) => c.name !== name),
              { id: crypto.randomUUID(), name, config: { ...carConfig } },
            ],
          })
        }
      },

      loadSavedConfig(id) {
        const found = get().savedConfigs.find((c) => c.id === id)
        if (found) set({ carConfig: { ...found.config } })
      },

      async deleteSavedConfig(id) {
        set((s) => ({ savedConfigs: s.savedConfigs.filter((c) => c.id !== id) }))
        try {
          await setupsApi.deleteSetup(id)
        } catch {
          console.warn('Failed to delete setup from MongoDB')
        }
      },

      // ── Strategy Builder (MongoDB-backed) ──────────────────────────────
      strategies: [{ ...DEFAULT_STRATEGY }],
      activeStrategyIds: ['s1'],
      _strategiesSynced: false,

      async fetchStrategies() {
        try {
          const docs = await setupsApi.fetchStrategies()
          if (docs.length > 0) {
            const strategies = docs.map(normalizeStrategy)
            set({
              strategies,
              activeStrategyIds: [strategies[0].id],
              _strategiesSynced: true,
            })
          }
        } catch {
          console.warn('MongoDB unavailable, using localStorage strategies')
        }
      },

      async addStrategy() {
        const localId = `s${Date.now()}`
        const newStrat = {
          id: localId,
          label: `Strategy ${get().strategies.length + 1}`,
          stints: [
            { id: `st${Date.now()}a`, compound: 'Soft',   laps: 20 },
            { id: `st${Date.now()}b`, compound: 'Medium', laps: 20 },
            { id: `st${Date.now()}c`, compound: 'Hard',   laps: 17 },
          ],
        }

        try {
          const doc = await setupsApi.createStrategy(newStrat.label, newStrat.stints)
          const normalized = normalizeStrategy(doc)
          set((s) => ({ strategies: [...s.strategies, normalized] }))
        } catch {
          // Fallback: local only
          set((s) => ({ strategies: [...s.strategies, newStrat] }))
        }
      },

      updateStint(strategyId, stintId, patch) {
        set((s) => ({
          strategies: s.strategies.map((strat) =>
            strat.id !== strategyId ? strat : {
              ...strat,
              stints: strat.stints.map((st) =>
                st.id !== stintId ? st : { ...st, ...patch }
              ),
            }
          ),
        }))
        // Debounced save to MongoDB
        const strat = get().strategies.find((s) => s.id === strategyId)
        if (strat) {
          setupsApi.updateStrategy(strategyId, strat.label, strat.stints).catch(() => {})
        }
      },

      addStint(strategyId, compound = 'Hard') {
        const newStint = { id: `st${Date.now()}`, compound, laps: 15 }
        set((s) => ({
          strategies: s.strategies.map((strat) =>
            strat.id !== strategyId ? strat : {
              ...strat,
              stints: [...strat.stints, newStint],
            }
          ),
        }))
        const strat = get().strategies.find((s) => s.id === strategyId)
        if (strat) {
          setupsApi.updateStrategy(strategyId, strat.label, strat.stints).catch(() => {})
        }
      },

      removeStint(strategyId, stintId) {
        set((s) => ({
          strategies: s.strategies.map((strat) =>
            strat.id !== strategyId ? strat : {
              ...strat,
              stints: strat.stints.filter((st) => st.id !== stintId),
            }
          ),
        }))
        const strat = get().strategies.find((s) => s.id === strategyId)
        if (strat) {
          setupsApi.updateStrategy(strategyId, strat.label, strat.stints).catch(() => {})
        }
      },

      setActiveStrategies: (ids) => set({ activeStrategyIds: ids.slice(0, 2) }),

      // ── Car Comparison ──────────────────────────────────────────────────
      compareTeams: ['red_bull', 'ferrari'],
      setCompareTeam: (slot, teamId) =>
        set((s) => {
          const next = [...s.compareTeams]
          next[slot] = teamId
          return { compareTeams: next }
        }),

      // ── Corner Explorer ─────────────────────────────────────────────────
      hoveredCorner: null,
      setHoveredCorner: (num) => set({ hoveredCorner: num }),
      cornerOverlayMode: 'speed',
      setCornerOverlayMode: (mode) => set({ cornerOverlayMode: mode }),

      // ── Comparison drivers for telemetry ────────────────────────────────
      compareDriverNumbers: [1, 16],
      setCompareDriverNumber: (slot, num) =>
        set((s) => {
          const next = [...s.compareDriverNumbers]
          next[slot] = num
          return { compareDriverNumbers: next }
        }),
    }),

    {
      name: 'f1-strategy-lab-v1',
      partialize: (state) => ({
        isDark:        state.isDark,
        carConfig:     state.carConfig,
        savedConfigs:  state.savedConfigs,
        strategies:    state.strategies,
        compareTeams:  state.compareTeams,
      }),
    }
  )
)
