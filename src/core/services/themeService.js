const THEME_KEY = 'mantine-color-scheme';

export const themeService = {
  getColorScheme: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(THEME_KEY) || 'light';
    }
    return 'light';
  },

  setColorScheme: (colorScheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, colorScheme);
    }
  },

  toggleColorScheme: () => {
    const currentScheme = themeService.getColorScheme();
    const newScheme = currentScheme === 'light' ? 'dark' : 'light';
    themeService.setColorScheme(newScheme);
    return newScheme;
  }
}; 