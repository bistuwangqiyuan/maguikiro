# Navigation Components

This directory contains navigation-related components for the magnetic testing instrument application.

## Components

### NavigationMenu

A full-screen modal navigation menu that provides access to all major application features.

#### Features

- **Menu Button Trigger**: Opens/closes when menu button is clicked
- **10 Menu Items**: 
  - File Management (文件管理)
  - Position (切位置)
  - Display (图像显示)
  - Threshold Settings (阈值设置)
  - Gate Settings (闸门设置)
  - System Settings (系统设置)
  - Fullscreen Mode (全屏模式)
  - Calibration (校准)
  - Help (帮助)
  - About (关于)
- **Smooth Animations**: Fade-in backdrop and slide-in panel
- **Active State Indication**: Highlights current page
- **Bilingual Labels**: Chinese and English for each menu item
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Accessible**: Supports keyboard navigation

#### Usage

```svelte
<script>
  import { NavigationMenu } from '$lib/components/navigation';
  
  let isMenuOpen = $state(false);
  
  function openMenu() {
    isMenuOpen = true;
  }
  
  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<button onclick={openMenu}>Open Menu</button>

<NavigationMenu isOpen={isMenuOpen} onClose={closeMenu} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Controls menu visibility |
| `onClose` | `() => void` | `undefined` | Callback when menu should close |

#### Menu Items Configuration

Each menu item has:
- `id`: Unique identifier
- `label`: Chinese label
- `labelEn`: English label
- `icon`: SVG path data for icon
- `path`: Route to navigate to (optional)
- `action`: Custom action function (optional)

#### Styling

The component uses industrial-style design with:
- Orange accent color (#FF6B35)
- Dark background gradients
- Metallic textures and shadows
- Smooth hover and active states
- Grid layout for menu items

#### Integration

The NavigationMenu is integrated into the InstrumentShell component and triggered by the menu buttons on the left and right panels.

## File Structure

```
navigation/
├── NavigationMenu.svelte  # Main navigation menu component
├── index.ts              # Export barrel file
└── README.md            # This file
```

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **Requirement 5.1**: Menu button triggers display/hide
- **Requirement 5.2**: Contains all specified menu items
- **Requirement 5.3**: Smooth page transitions
- **Requirement 5.4**: Maintains testing state during navigation
- **Requirement 5.5**: Provides navigation controls

## Future Enhancements

- Add keyboard shortcuts for menu items
- Implement search/filter functionality
- Add recent pages section
- Support for custom menu item ordering
- Add menu item badges for notifications
