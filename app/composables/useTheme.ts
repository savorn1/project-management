export type ThemeName = 'indigo' | 'violet' | 'blue' | 'teal' | 'rose'

export interface ThemeOption {
  id: ThemeName
  label: string
  description: string
  color: string
}

export const THEMES: ThemeOption[] = [
  { id: 'indigo', label: 'Indigo',  description: 'Default indigo purple', color: '#6366f1' },
  { id: 'violet', label: 'Violet',  description: 'Rich violet purple',    color: '#8b5cf6' },
  { id: 'blue',   label: 'Ocean',   description: 'Deep ocean blue',       color: '#3b82f6' },
  { id: 'teal',   label: 'Teal',    description: 'Fresh teal green',      color: '#14b8a6' },
  { id: 'rose',   label: 'Rose',    description: 'Warm rose pink',        color: '#f43f5e' },
]

const STORAGE_KEY = 'taskflow-theme'

export const useTheme = () => {
  const theme = useState<ThemeName>('theme', () => 'indigo')
  const { scheduleSync } = useAppearanceSync()

  function applyTheme(name: ThemeName, sync = true) {
    theme.value = name
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', name)
      localStorage.setItem(STORAGE_KEY, name)
      if (sync) scheduleSync()
    }
  }

  function initTheme(savedTheme?: string) {
    if (import.meta.client) {
      const name = (savedTheme as ThemeName | undefined)
        ?? (localStorage.getItem(STORAGE_KEY) as ThemeName | null)
        ?? 'indigo'
      applyTheme(name, false) // no API sync on init
    }
  }

  return { theme, applyTheme, initTheme, THEMES }
}
