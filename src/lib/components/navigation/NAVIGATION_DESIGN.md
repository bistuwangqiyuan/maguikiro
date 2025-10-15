# Navigation Menu Design Specification

## Visual Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Menu Backdrop                         │
│              (Semi-transparent overlay)                  │
│                                                          │
│    ┌───────────────────────────────────────────┐       │
│    │  主菜单 / Main Menu              [X]      │       │
│    ├───────────────────────────────────────────┤       │
│    │                                            │       │
│    │  ┌────┐  ┌────┐  ┌────┐  ┌────┐         │       │
│    │  │ 📁 │  │ 📍 │  │ 🖥️ │  │ ⚙️ │         │       │
│    │  │文件│  │切位│  │图像│  │阈值│         │       │
│    │  │File│  │Pos │  │Disp│  │Thre│         │       │
│    │  └────┘  └────┘  └────┘  └────┘         │       │
│    │                                            │       │
│    │  ┌────┐  ┌────┐  ┌────┐  ┌────┐         │       │
│    │  │ 🚪 │  │ 🔧 │  │ ⛶  │  │ 🔬 │         │       │
│    │  │闸门│  │系统│  │全屏│  │校准│         │       │
│    │  │Gate│  │Sett│  │Full│  │Cali│         │       │
│    │  └────┘  └────┘  └────┘  └────┘         │       │
│    │                                            │       │
│    │  ┌────┐  ┌────┐                          │       │
│    │  │ ❓ │  │ ℹ️ │                          │       │
│    │  │帮助│  │关于│                          │       │
│    │  │Help│  │Abou│                          │       │
│    │  └────┘  └────┘                          │       │
│    │                                            │       │
│    └───────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Color Palette

### Primary Colors
- **Orange Accent**: `#FF6B35` - Active states, borders, highlights
- **Orange Dark**: `#E55A2B` - Gradient end, pressed states
- **Orange Light**: `#FF8555` - Hover highlights

### Background Colors
- **Dark Primary**: `#1A1A1A` - Main backgrounds
- **Dark Medium**: `#2D2D2D` - Panel backgrounds
- **Dark Light**: `#3D3D3D` - Elevated surfaces

### Text Colors
- **Primary Text**: `#FFFFFF` - Main labels
- **Secondary Text**: `#B0B0B0` - Sublabels, descriptions
- **Disabled Text**: `#666666` - Inactive elements

### Border Colors
- **Default Border**: `#4A4A4A` - Normal state
- **Active Border**: `#FF6B35` - Active/hover state
- **Subtle Border**: `#3D3D3D` - Dividers

## Typography

### Font Families
- **Primary**: System fonts (Roboto, -apple-system, sans-serif)
- **Monospace**: Roboto Mono (for data display)

### Font Sizes
- **Menu Title**: 20px, Bold, Uppercase
- **Menu Item Label (Chinese)**: 14px, Semi-bold
- **Menu Item Label (English)**: 11px, Uppercase
- **Close Button**: 24px icon

### Font Weights
- **Bold**: 700 (Titles, active states)
- **Semi-bold**: 600 (Labels)
- **Regular**: 400 (Body text)

## Spacing

### Padding
- **Menu Panel**: 0px (header has own padding)
- **Menu Header**: 20px vertical, 24px horizontal
- **Menu Items Container**: 16px all sides
- **Menu Item**: 20px vertical, 16px horizontal

### Gaps
- **Menu Items Grid**: 12px
- **Icon to Label**: 12px
- **Label Lines**: 4px

### Margins
- **Menu Title**: 0px (uses padding)
- **Close Button**: 0px (aligned to edge)

## Dimensions

### Menu Panel
- **Width**: 90% of viewport (max 600px)
- **Max Height**: 80vh
- **Border Radius**: 12px
- **Border Width**: 3px

### Menu Items
- **Min Width**: 160px (desktop), 140px (mobile)
- **Min Height**: 120px (desktop), 100px (mobile)
- **Border Radius**: 8px
- **Border Width**: 2px

### Icons
- **Menu Icon**: 40px × 40px (desktop), 32px (mobile)
- **Close Icon**: 24px × 24px
- **Check Icon**: 20px × 20px

### Close Button
- **Size**: 40px × 40px
- **Border Radius**: 8px
- **Border Width**: 2px

## Shadows

### Menu Panel
```css
box-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.6),
  0 0 20px rgba(255, 107, 53, 0.4),
  inset 0 2px 4px rgba(255, 255, 255, 0.1);
```

### Menu Items (Normal)
```css
box-shadow: 
  0 2px 4px rgba(0, 0, 0, 0.3),
  inset 0 1px 2px rgba(255, 255, 255, 0.1);
```

### Menu Items (Hover)
```css
box-shadow: 
  0 4px 8px rgba(0, 0, 0, 0.4),
  0 0 16px rgba(255, 107, 53, 0.3);
```

### Menu Items (Active)
```css
box-shadow: 
  0 4px 8px rgba(0, 0, 0, 0.4),
  0 0 20px rgba(255, 107, 53, 0.6),
  inset 0 1px 2px rgba(255, 255, 255, 0.2);
```

## Animations

### Backdrop Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 0.2s, Easing: ease-out */
```

### Panel Slide In
```css
@keyframes slideIn {
  from {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
/* Duration: 0.3s, Easing: ease-out */
```

### Menu Item Hover
```css
transition: all 0.2s ease;
transform: translateY(-2px);
```

### Close Button Hover
```css
transition: all 0.2s ease;
/* Color and border changes */
```

## States

### Menu Item States

#### Normal
- Background: `linear-gradient(135deg, #3d3d3d 0%, #2d2d2d 100%)`
- Border: `2px solid #4a4a4a`
- Text: `#b0b0b0`

#### Hover
- Background: `linear-gradient(135deg, #4a4a4a 0%, #3d3d3d 100%)`
- Border: `2px solid #FF6B35`
- Text: `#ffffff`
- Transform: `translateY(-2px)`
- Glow: Orange shadow

#### Active (Current Page)
- Background: `linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)`
- Border: `2px solid #FF6B35`
- Text: `#ffffff`
- Check Icon: Visible
- Glow: Strong orange shadow

#### Pressed
- Transform: `translateY(0)`
- Shadow: Reduced

## Responsive Breakpoints

### Desktop (≥1024px)
- Menu Panel: 90% width, max 600px
- Grid Columns: 4 items per row
- Menu Item: 160px min width, 120px min height
- Icon Size: 40px

### Tablet (768px - 1023px)
- Menu Panel: 90% width, max 600px
- Grid Columns: 3 items per row
- Menu Item: 150px min width, 110px min height
- Icon Size: 36px

### Mobile (≤767px)
- Menu Panel: 95% width
- Grid Columns: 2 items per row
- Menu Item: 140px min width, 100px min height
- Icon Size: 32px
- Font sizes reduced by 1-2px

## Accessibility

### ARIA Labels
- Menu backdrop: `aria-label="Close menu"`
- Menu panel: `role="dialog" aria-modal="true" aria-label="Navigation menu"`
- Close button: `aria-label="Close menu"`
- Menu items: `aria-label="[Chinese] / [English]"`

### Focus Management
- Close button is focusable
- Menu items are focusable
- Tab order follows visual order
- Focus visible with outline

### Keyboard Support (Future)
- `Escape`: Close menu
- `Tab`: Navigate items
- `Enter/Space`: Activate item
- `Arrow Keys`: Navigate grid

## Scrollbar Styling

### Webkit Browsers
```css
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #FF6B35;
}
```

## Grid Layout

### Desktop
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
gap: 12px;
```

### Mobile
```css
grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
gap: 10px;
```

## Backdrop Effect

```css
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(4px);
```

This creates a semi-transparent dark overlay with a blur effect on the content behind the menu.

## Implementation Notes

1. **Performance**: Uses CSS animations instead of JavaScript for smooth 60fps
2. **Accessibility**: Includes ARIA labels and semantic HTML
3. **Responsive**: Grid layout automatically adjusts columns
4. **Touch-Friendly**: Large touch targets (120px+ height)
5. **Visual Feedback**: Clear hover and active states
6. **Professional**: Industrial design matching DOPPLER brand
