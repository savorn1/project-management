export type Density   = 'compact' | 'default' | 'comfortable'
export type RadiusMode = 'sharp'   | 'default' | 'pill'
export type CardStyle  = 'default' | 'glass'   | 'solid'

export interface UISettings {
  density:          Density
  radius:           RadiusMode
  cardStyle:        CardStyle
  reduceMotion:     boolean
  sidebarCollapsed: boolean
}

const DEFAULTS: UISettings = {
  density:          'default',
  radius:           'default',
  cardStyle:        'default',
  reduceMotion:     false,
  sidebarCollapsed: false,
}

const KEY = 'taskflow-ui'

export const useUISettings = () => {
  const settings = useState<UISettings>('ui-settings', () => ({ ...DEFAULTS }))
  const { scheduleSync } = useAppearanceSync()

  function applyAll(s: UISettings) {
    if (!import.meta.client) return
    const html = document.documentElement
    html.setAttribute('data-density', s.density)
    html.setAttribute('data-radius',  s.radius)
    html.setAttribute('data-card',    s.cardStyle)
    html.setAttribute('data-motion',  s.reduceMotion     ? 'reduced'   : 'normal')
    html.setAttribute('data-sidebar', s.sidebarCollapsed ? 'collapsed' : 'expanded')
  }

  function set<K extends keyof UISettings>(key: K, value: UISettings[K]) {
    settings.value = { ...settings.value, [key]: value }
    applyAll(settings.value)
    if (import.meta.client) localStorage.setItem(KEY, JSON.stringify(settings.value))
    scheduleSync()
  }

  function resetAll() {
    settings.value = { ...DEFAULTS }
    applyAll(settings.value)
    if (import.meta.client) localStorage.removeItem(KEY)
    scheduleSync()
  }

  function initSettings(apiSettings?: Record<string, unknown>) {
    if (!import.meta.client) return
    if (apiSettings && Object.keys(apiSettings).length > 0) {
      settings.value = {
        density:          (apiSettings.density          as Density    | undefined) ?? DEFAULTS.density,
        radius:           (apiSettings.radius           as RadiusMode | undefined) ?? DEFAULTS.radius,
        cardStyle:        (apiSettings.cardStyle        as CardStyle  | undefined) ?? DEFAULTS.cardStyle,
        reduceMotion:     (apiSettings.reduceMotion     as boolean    | undefined) ?? DEFAULTS.reduceMotion,
        sidebarCollapsed: (apiSettings.sidebarCollapsed as boolean    | undefined) ?? DEFAULTS.sidebarCollapsed,
      }
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<UISettings>
        settings.value = { ...DEFAULTS, ...saved }
      } catch {
        settings.value = { ...DEFAULTS }
      }
    }
    applyAll(settings.value)
  }

  return { settings, set, resetAll, initSettings }
}
