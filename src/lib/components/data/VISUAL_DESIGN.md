# DataTable Component - Visual Design Specification

## Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ DATA TABLE CONTAINER                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TABLE INFO PANEL                                            │ │
│ │ 总数据点: 100  │  当前页: 1/5  │  异常数据: 8                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TABLE HEADER (Sticky)                                       │ │
│ │ ┌────┬──────────┬──────────┬──────────┬──────────┬────────┐ │ │
│ │ │序号│位置(s) ▲│幅值(V)   │相位(°)   │频率(Hz)  │状态    │ │ │
│ │ └────┴──────────┴──────────┴──────────┴──────────┴────────┘ │ │
│ │                                                             │ │
│ │ TABLE BODY (Scrollable)                                     │ │
│ │ ┌────┬──────────┬──────────┬──────────┬──────────┬────────┐ │ │
│ │ │ 1  │ 0.000    │  0.523   │  45.2    │  100.0   │ 正常   │ │ │
│ │ │ 2  │ 0.010    │  0.812   │  62.8    │  100.0   │ 正常   │ │ │
│ │ │ 3  │ 0.020    │  1.456   │  88.3    │  100.0   │ 异常   │ │ │ ← Red tint
│ │ │ 4  │ 0.030    │  0.234   │  23.1    │  100.0   │ 正常   │ │ │
│ │ │ 5  │ 0.040    │ -0.678   │ -52.4    │  100.0   │ 正常   │ │ │ ← Selected
│ │ │... │   ...    │   ...    │   ...    │   ...    │  ...   │ │ │
│ │ └────┴──────────┴──────────┴──────────┴──────────┴────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ PAGINATION CONTROLS                                         │ │
│ │  [上一页]  [1] [2] [3] ... [10]  [下一页]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Background Colors
```css
--bg-dark: #1A1A1A        /* Main container background */
--bg-medium: #2D2D2D      /* Table info, pagination, header */
--bg-light: #3D3D3D       /* Borders, hover states */
```

### Text Colors
```css
--text-primary: #FFFFFF    /* Main text */
--text-secondary: #B0B0B0  /* Labels, secondary info */
--text-disabled: #666666   /* Disabled elements */
```

### Accent Colors
```css
--primary-orange: #FF6B35  /* Headers, highlights, active states */
--success: #4CAF50         /* Normal status badge */
--error: #F44336           /* Abnormal status badge, alerts */
--warning: #FFC107         /* Warnings */
--info: #2196F3            /* Information */
```

### Special Colors
```css
--waveform-gate-a: #FFD700  /* Gate A reference */
--waveform-gate-b: #FF69B4  /* Gate B reference */
```

## Typography

### Font Families
- **Main Text**: System default or Roboto
- **Numeric Data**: 'Roboto Mono', monospace
- **Headers**: Roboto, bold weight

### Font Sizes
```css
.table-info .label: 0.875rem (14px)
.table-info .value: 0.875rem (14px), bold
.data-table: 0.875rem (14px)
.data-table th: 0.875rem (14px), bold
.status-badge: 0.75rem (12px), bold
.pagination: 0.875rem (14px)
```

## Component States

### Normal Row
```
Background: transparent
Text: #FFFFFF
Border: 1px solid #3D3D3D
Status Badge: Green (#4CAF50)
```

### Hover Row
```
Background: #2D2D2D
Cursor: pointer
Transition: 0.2s
```

### Selected Row
```
Background: rgba(255, 107, 53, 0.1)
Border-left: 3px solid #FF6B35
Text: #FFFFFF
```

### Abnormal Row
```
Background: rgba(244, 67, 54, 0.05)
Status Badge: Red (#F44336)
```

### Abnormal + Selected Row
```
Background: rgba(244, 67, 54, 0.15)
Border-left: 3px solid #F44336
```

## Interactive Elements

### Sortable Column Header
```
Default:
  Background: #2D2D2D
  Color: #FF6B35
  Cursor: pointer

Hover:
  Background: #3D3D3D

Active (Sorted):
  Sort Icon: ▲ or ▼
  Color: #FF6B35
```

### Pagination Buttons
```
Default:
  Background: #3D3D3D
  Color: #FFFFFF
  Border: 1px solid #3D3D3D

Hover:
  Background: #FF6B35
  Border: #FF6B35

Active (Current Page):
  Background: #FF6B35
  Border: #FF6B35
  Font-weight: 600

Disabled:
  Opacity: 0.5
  Cursor: not-allowed
```

### Status Badges
```
Normal:
  Background: #4CAF50
  Color: white
  Padding: 0.25rem 0.75rem
  Border-radius: 0.25rem

Abnormal:
  Background: #F44336
  Color: white
  Padding: 0.25rem 0.75rem
  Border-radius: 0.25rem
```

## Spacing & Layout

### Container Padding
```css
.data-table-container: 1rem
.table-info: 0.75rem 1rem
.pagination: 1rem
```

### Table Cell Padding
```css
th, td: 0.75rem 1rem
```

### Gaps
```css
.data-table-container: 1rem gap between sections
.table-info: 2rem gap between items
.pagination: 0.5rem gap between buttons
.page-numbers: 0.25rem gap between page buttons
```

## Responsive Breakpoints

### Desktop (≥1024px)
- Full layout
- All columns visible
- Standard padding and font sizes

### Tablet (768px - 1023px)
- Slightly reduced padding
- All columns visible
- Adjusted font sizes

### Mobile (<768px)
```css
.table-info: flex-direction: column
.data-table: font-size: 0.75rem
th, td: padding: 0.5rem
.pagination: flex-wrap
.btn-page: padding: 0.375rem 0.75rem, font-size: 0.75rem
```

## Animations & Transitions

### Row Hover
```css
transition: background-color 0.2s ease
```

### Button Hover
```css
transition: all 0.2s ease
transform: translateY(-1px) on hover
box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3)
```

### Sort Icon
```css
transition: transform 0.2s ease
```

## Accessibility Features

### Semantic Structure
- `<table>` for tabular data
- `<thead>` for headers
- `<tbody>` for data rows
- `<th>` for column headers
- `<td>` for data cells

### Visual Indicators
- High contrast colors (4.5:1 minimum)
- Multiple indicators for state (color + text + icon)
- Clear focus indicators
- Sufficient touch target sizes (44x44px minimum)

### Keyboard Navigation (Future)
- Tab through interactive elements
- Enter to sort columns
- Arrow keys for pagination
- Space to select rows

## Print Styles (Future Enhancement)

```css
@media print {
  .pagination { display: none; }
  .data-table { page-break-inside: avoid; }
  background colors: removed for ink saving
  borders: solid black for clarity
}
```

## Dark Mode Considerations

The component is designed for dark mode by default. For light mode support:

```css
@media (prefers-color-scheme: light) {
  --bg-dark: #FFFFFF;
  --bg-medium: #F5F5F5;
  --bg-light: #E0E0E0;
  --text-primary: #000000;
  --text-secondary: #666666;
}
```

## Component Dimensions

### Minimum Dimensions
- Min-width: 600px (scrollable on smaller screens)
- Min-height: 400px (recommended)

### Recommended Dimensions
- Width: 100% of container
- Height: 600px - 800px for optimal viewing

### Maximum Dimensions
- Max-width: 100% of viewport
- Max-height: 90vh (for modal usage)

## Visual Hierarchy

1. **Primary**: Table data (largest, most prominent)
2. **Secondary**: Column headers (orange, bold)
3. **Tertiary**: Table info panel (smaller, secondary color)
4. **Quaternary**: Pagination controls (smallest, utility)

## Industrial Design Elements

### Metal Texture (Subtle)
- Slight gradient on headers
- Box shadows for depth
- Border highlights for 3D effect

### Professional Feel
- Monospace fonts for precision
- Consistent spacing and alignment
- Clean, uncluttered layout
- High contrast for readability

### DOPPLER Brand Integration
- Orange accent color (#FF6B35)
- Dark industrial background
- Professional typography
- Technical aesthetic

## Comparison with Other Components

### Consistency with WaveformChart
- Same color scheme
- Same font families
- Same border styles
- Same hover effects

### Consistency with ParameterPanel
- Same input styling
- Same button styling
- Same spacing system
- Same responsive behavior

## Future Visual Enhancements

1. **Column Resizing**: Drag handles on column borders
2. **Row Striping**: Alternating row colors option
3. **Density Options**: Compact/Normal/Comfortable views
4. **Custom Themes**: User-selectable color schemes
5. **Data Visualization**: Inline sparklines for trends
6. **Export Preview**: Visual preview before export
7. **Loading States**: Skeleton screens and spinners
8. **Empty States**: Illustrated empty state messages

## Design Tokens (Future)

For design system integration:

```typescript
export const dataTableTokens = {
  colors: {
    background: 'var(--bg-dark)',
    surface: 'var(--bg-medium)',
    border: 'var(--bg-light)',
    text: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    accent: 'var(--primary-orange)',
    success: 'var(--success)',
    error: 'var(--error)'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem'
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontFamilyMono: 'Roboto Mono, monospace',
    fontSize: '0.875rem',
    fontWeight: 400,
    fontWeightBold: 600
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem'
  }
};
```

## Conclusion

The DataTable component follows a professional, industrial design language that matches the DOPPLER brand aesthetic while maintaining excellent usability and accessibility standards.
