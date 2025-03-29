import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      // Set theme and update DOM
      setTheme: (theme: Theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(theme);
        }
      },

      // Toggle between light and dark themes
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Initialize theme from localStorage or system preference
      initializeTheme: () => {
        if (typeof window !== 'undefined') {
          // Check if user has previously set a preference
          const storedTheme = localStorage.getItem('theme');

          if (storedTheme) {
            set({ theme: storedTheme as Theme });
          } else {
            // Check system preference
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            set({ theme: systemPreference });
          }
        }
      },
    }),
    {
      name: 'theme-storage', // localStorage key
      partialize: (state) => ({ theme: state.theme }), // Only persist the theme value
    },
  ),
);
