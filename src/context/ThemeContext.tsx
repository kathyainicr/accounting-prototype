import { createContext, useContext } from 'react'

type ThemeContextValue = {
  colorScheme: 'light' | 'dark'
  setColorScheme: (scheme: 'light' | 'dark') => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'dark',
  setColorScheme: () => {},
})

export const useThemeContext = () => useContext(ThemeContext)
