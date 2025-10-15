# Instrument Shell Components

This directory contains the industrial-grade instrument shell interface components for the DOPPLER magnetic testing instrument system.

## Components

### InstrumentShell
The main container component that provides the industrial instrument interface with orange border and black body.

**Usage:**
```svelte
<InstrumentShell>
  <!-- Your content here -->
</InstrumentShell>
```

### TopBar
Displays the DOPPLER brand logo, model information, and system status.

**Features:**
- Brand logo with orange glow effect
- Model information (MT-2000 Series)
- Real-time clock display
- System status indicator

### LeftPanel
Contains the main control buttons on the left side of the instrument.

**Buttons:**
- Play (播放) - Start testing
- Pause (暂停) - Pause testing
- DISP - Display settings
- Main Menu (主菜单) - Navigation menu
- GATE - Gate settings
- VPA - VPA controls

**Events:**
- `play` - Emitted when play button is clicked
- `pause` - Emitted when pause button is clicked
- `disp` - Emitted when DISP button is clicked
- `menu` - Emitted when menu button is clicked
- `gate` - Emitted when GATE button is clicked
- `vpa` - Emitted when VPA button is clicked

**Usage:**
```svelte
<LeftPanel 
  on:play={handlePlay}
  on:pause={handlePause}
  on:menu={handleMenu}
/>
```

### RightPanel
Contains control buttons and a rotary knob on the right side.

**Buttons:**
- Back (返回) - Navigate back
- SAVE - Save current data
- MENU - Additional menu options

**Knob:**
- Rotary control knob (0-100 range)
- Drag up/down to adjust value
- Visual indicator shows current position

**Events:**
- `back` - Emitted when back button is clicked
- `save` - Emitted when save button is clicked
- `menu` - Emitted when menu button is clicked
- `knobChange` - Emitted when knob value changes (detail: { value: number })

**Usage:**
```svelte
<RightPanel 
  on:save={handleSave}
  on:knobChange={handleKnobChange}
/>
```

### MainDisplay
The central display area where content is rendered.

**Features:**
- Dark gradient background
- Inset shadow for depth
- Custom scrollbar styling
- Orange accent glow at top

**Usage:**
```svelte
<MainDisplay>
  <!-- Your main content here -->
</MainDisplay>
```

## Design Features

### Industrial Color Scheme
- Primary Orange: `#FF6B35`
- Dark Background: `#1A1A1A`
- Medium Background: `#2D2D2D`
- Light Background: `#3D3D3D`

### Visual Effects
- Metallic gradients
- Inset and drop shadows
- Glow effects on active elements
- Smooth transitions and hover states

### Interaction Feedback
- Button press animations
- Active state highlighting
- Hover effects with orange glow
- Disabled state styling

## Accessibility
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- Semantic HTML structure

## Responsive Design
The instrument shell is designed for desktop use but includes responsive considerations:
- Minimum recommended width: 1024px
- Optimized for landscape orientation
- Touch-friendly button sizes (80px height)
