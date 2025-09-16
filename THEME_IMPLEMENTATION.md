# Dark Mode and Light Mode Implementation

This document explains how the dark mode and light mode functionality has been implemented in the eXtremeScheduler application.

## Overview

The application now supports both dark mode and light mode using Mantine UI's built-in theming system. The theme preference is persisted in localStorage and can be toggled using a button in the header.

## Implementation Details

### 1. Theme Service (`src/core/services/themeService.js`)
- Manages theme persistence in localStorage
- Provides methods to get, set, and toggle color scheme
- Uses the key `'mantine-color-scheme'` for storage

### 2. Theme Context (`src/core/context/ThemeContext.jsx`)
- React context that manages theme state across the application
- Provides `useTheme` hook for components to access theme functionality
- Automatically initializes theme from localStorage on app startup

### 3. MantineProvider Configuration (`src/index.js`)
- Updated to use the theme context
- Configured with theme-aware colors and fonts
- Supports dynamic theme switching

### 4. Theme Toggle Button (`src/core/components/AppHeader.jsx`)
- Added a theme toggle button in the header
- Shows sun icon for dark mode, moon icon for light mode
- Includes tooltip with descriptive text
- Positioned next to the user profile menu

### 5. Theme-Aware Components
The following components have been updated to use theme-aware colors:
- `Layout.jsx` - Background and border colors
- `AppHeader.jsx` - Border colors
- `Sidebar.jsx` - Already theme-aware
- `LinksGroup.jsx` - Already theme-aware
- `Login.jsx` - Already theme-aware

## Usage

### For Users
1. Click the theme toggle button (sun/moon icon) in the header
2. The theme will switch between light and dark mode
3. Your preference is automatically saved and restored on next visit

### For Developers

#### Using the Theme Hook
```jsx
import { useTheme } from 'core/context/ThemeContext';

function MyComponent() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {colorScheme}</p>
      <button onClick={toggleColorScheme}>Toggle Theme</button>
      <button onClick={() => setColorScheme('dark')}>Set Dark</button>
      <button onClick={() => setColorScheme('light')}>Set Light</button>
    </div>
  );
}
```

#### Creating Theme-Aware Styles
```jsx
const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.colors.dark[8] 
      : theme.colors.gray[0],
    color: theme.colorScheme === 'dark' 
      ? theme.white 
      : theme.black,
    border: `1px solid ${
      theme.colorScheme === 'dark' 
        ? theme.colors.dark[4] 
        : theme.colors.gray[3]
    }`,
  },
}));
```

## Theme Colors

### Light Mode
- Background: `theme.colors.gray[0]`
- Text: `theme.black`
- Borders: `theme.colors.gray[3]`
- Hover: `theme.colors.gray[0]`

### Dark Mode
- Background: `theme.colors.dark[8]`
- Text: `theme.white`
- Borders: `theme.colors.dark[4]`
- Hover: `theme.colors.dark[7]`

## Browser Support
- Theme preference is stored in localStorage
- Works with all modern browsers
- Gracefully falls back to light mode if localStorage is not available

## Future Enhancements
- System theme detection (respects OS dark/light mode preference)
- Custom theme colors
- Animated theme transitions
- Theme-specific component variants 