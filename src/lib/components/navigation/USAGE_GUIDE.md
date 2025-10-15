# Navigation Menu Usage Guide

## Quick Start

### Basic Usage

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

## Integration with InstrumentShell

The NavigationMenu is already integrated into the InstrumentShell component. The menu buttons on the left and right panels automatically trigger the menu.

### How It Works

1. User clicks "主菜单" button on left panel or "MENU" button on right panel
2. `handleMenu()` function toggles `isMenuOpen` state
3. NavigationMenu component renders when `isMenuOpen` is true
4. User clicks a menu item or close button
5. Menu closes and navigates to selected page (if applicable)

## Menu Items Configuration

### Adding a New Menu Item

To add a new menu item, edit the `menuItems` array in `NavigationMenu.svelte`:

```typescript
const menuItems: MenuItem[] = [
  // ... existing items
  {
    id: 'new-feature',
    label: '新功能',
    labelEn: 'New Feature',
    icon: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z',
    path: '/new-feature'
  }
];
```

### Menu Item Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `label` | `string` | Yes | Chinese label |
| `labelEn` | `string` | Yes | English label |
| `icon` | `string` | Yes | SVG path data |
| `path` | `string` | No | Route to navigate to |
| `action` | `() => void` | No | Custom action function |

### Icon Sources

Icons use Material Design SVG paths. Find icons at:
- [Material Icons](https://fonts.google.com/icons)
- [Material Design Icons](https://materialdesignicons.com/)

Copy the SVG `<path>` element's `d` attribute value.

## Customization

### Changing Colors

Edit the CSS custom properties in your global styles or component:

```css
:root {
  --primary-orange: #FF6B35;  /* Change to your brand color */
  --primary-orange-dark: #E55A2B;
  --primary-orange-light: #FF8555;
}
```

### Adjusting Grid Layout

Modify the grid template in the `.menu-items` class:

```css
.menu-items {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  /* Change 160px to adjust minimum item width */
  gap: 12px;  /* Adjust spacing between items */
}
```

### Changing Animation Speed

Modify animation durations:

```css
.menu-backdrop {
  animation: fadeIn 0.2s ease-out;  /* Backdrop fade speed */
}

.menu-panel {
  animation: slideIn 0.3s ease-out;  /* Panel slide speed */
}
```

## Event Handling

### onClose Callback

The `onClose` callback is triggered when:
- User clicks the close button (X)
- User clicks outside the menu panel
- User navigates to a page (after navigation completes)

```svelte
<NavigationMenu 
  isOpen={isMenuOpen} 
  onClose={() => {
    isMenuOpen = false;
    console.log('Menu closed');
  }} 
/>
```

## Navigation Behavior

### With Path

Menu items with a `path` property will:
1. Navigate to the specified route using SvelteKit's `goto()`
2. Close the menu automatically
3. Highlight as active when on that page

```typescript
{
  id: 'settings',
  label: '系统设置',
  labelEn: 'System Settings',
  icon: '...',
  path: '/settings'  // Navigates to /settings
}
```

### With Action

Menu items with an `action` property will:
1. Execute the custom function
2. Close the menu automatically
3. Not navigate to a new page

```typescript
{
  id: 'fullscreen',
  label: '全屏模式',
  labelEn: 'Fullscreen',
  icon: '...',
  action: toggleFullscreen  // Executes custom function
}
```

## Active State Detection

The menu automatically highlights the current page by comparing the menu item's `path` with the current route:

```typescript
function isCurrentPage(path?: string): boolean {
  if (!path) return false;
  return $page.url.pathname === path;
}
```

This uses SvelteKit's `$page` store to get the current pathname.

## Responsive Behavior

The menu automatically adapts to different screen sizes:

### Desktop (≥1024px)
- 4 columns grid
- 160px minimum item width
- 120px minimum item height

### Tablet (768px - 1023px)
- 3 columns grid
- 150px minimum item width
- 110px minimum item height

### Mobile (≤767px)
- 2 columns grid
- 140px minimum item width
- 100px minimum item height

## Accessibility Features

### Current Implementation
- ARIA labels on interactive elements
- Semantic HTML structure
- Keyboard-accessible close button
- High contrast colors

### Future Enhancements
- Escape key to close menu
- Arrow key navigation between items
- Focus trap within menu
- Tab order management
- Screen reader announcements

## Testing

### Manual Testing Checklist

1. **Open Menu**
   - [ ] Click menu button
   - [ ] Menu fades in smoothly
   - [ ] Backdrop appears with blur

2. **Navigate**
   - [ ] Click menu item with path
   - [ ] Navigates to correct page
   - [ ] Menu closes automatically
   - [ ] Active state updates

3. **Close Menu**
   - [ ] Click close button
   - [ ] Click outside menu
   - [ ] Menu fades out smoothly

4. **Fullscreen**
   - [ ] Click fullscreen item
   - [ ] Browser enters fullscreen
   - [ ] Menu closes

5. **Responsive**
   - [ ] Resize window
   - [ ] Grid adjusts columns
   - [ ] Items remain readable

### Automated Testing

```typescript
// Example test with Playwright
test('navigation menu opens and closes', async ({ page }) => {
  await page.goto('/');
  
  // Open menu
  await page.click('button:has-text("主菜单")');
  await expect(page.locator('.menu-panel')).toBeVisible();
  
  // Close menu
  await page.click('.close-button');
  await expect(page.locator('.menu-panel')).not.toBeVisible();
});
```

## Common Issues

### Menu Not Opening
- Check that `isOpen` prop is being set to `true`
- Verify menu button click handler is calling the correct function
- Check browser console for errors

### Navigation Not Working
- Ensure routes exist in your SvelteKit app
- Check that `path` property is correct
- Verify SvelteKit router is configured properly

### Styling Issues
- Check that CSS custom properties are defined
- Verify no conflicting global styles
- Ensure component is not inside a container with `overflow: hidden`

### Animation Jank
- Check browser performance
- Reduce animation complexity if needed
- Ensure no heavy JavaScript running during animation

## Best Practices

1. **Keep Menu Items Focused**: Only include primary navigation items
2. **Use Clear Labels**: Both Chinese and English should be concise
3. **Consistent Icons**: Use icons from the same icon set
4. **Test on Mobile**: Ensure touch targets are large enough
5. **Maintain State**: Don't lose testing data when navigating
6. **Provide Feedback**: Show active state for current page
7. **Fast Animations**: Keep animations under 300ms
8. **Accessible**: Always include ARIA labels

## Performance Tips

1. **Lazy Load**: Menu only renders when open
2. **CSS Animations**: Use CSS instead of JavaScript
3. **Optimize Icons**: Use SVG paths instead of icon fonts
4. **Minimize Reflows**: Use transforms for animations
5. **Debounce**: If adding search, debounce input

## Examples

### Example 1: Custom Action

```typescript
{
  id: 'export',
  label: '导出数据',
  labelEn: 'Export Data',
  icon: '...',
  action: async () => {
    await exportData();
    showToast('Data exported successfully');
  }
}
```

### Example 2: Conditional Menu Items

```typescript
const menuItems = $derived(() => {
  const items = [...baseMenuItems];
  
  if ($authStore.user?.role === 'admin') {
    items.push({
      id: 'admin',
      label: '管理面板',
      labelEn: 'Admin Panel',
      icon: '...',
      path: '/admin'
    });
  }
  
  return items;
});
```

### Example 3: Menu with Confirmation

```typescript
{
  id: 'reset',
  label: '重置系统',
  labelEn: 'Reset System',
  icon: '...',
  action: async () => {
    if (confirm('Are you sure you want to reset?')) {
      await resetSystem();
    }
  }
}
```

## Support

For issues or questions:
1. Check this usage guide
2. Review the README.md
3. Check the design specification
4. Test with the demo page at `/demo-navigation`
5. Review the component source code

## Version History

- **v1.0.0** (Current): Initial implementation with 10 menu items
  - Full-screen modal design
  - Smooth animations
  - Responsive grid layout
  - Active state detection
  - Fullscreen toggle support
