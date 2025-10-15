# Calibration Wizard - Usage Guide

## Quick Start

```svelte
<script>
  import CalibrationWizard from '$lib/components/settings/CalibrationWizard.svelte';
</script>

<CalibrationWizard 
  onComplete={(id) => console.log('Saved:', id)}
  onCancel={() => console.log('Cancelled')}
/>
```

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    CALIBRATION WIZARD                        │
└─────────────────────────────────────────────────────────────┘

Step 1: Prepare                    [Active]
   ↓
   • Enter Standard Block ID: "STD-001"
   • Operator: "John Doe" (auto-filled)
   • Notes: "Monthly calibration"
   • Click "Start Calibration"

Step 2: Capture                    [Active]
   ↓
   • Instructions displayed
   • Click "Capture Signal"
   • Loading... (2 seconds)
   • ✓ Signal captured: 1000 points
   • Stats: Avg: 0.6366, Max: 0.9987
   • Click "Next"

Step 3: Calculate                  [Active]
   ↓
   • Click "Start Calculation"
   • Loading... (1.5 seconds)
   • ✓ Calculation completed
   • Gain Correction: 1.5708
   • Phase Correction: -0.0234
   • Offset Correction: -0.0012
   • Deviation: 2.34% ✓ (< 5%)
   • Click "Next"

Step 4: Complete                   [Active]
   ↓
   • Review Summary:
     - Standard Block: STD-001
     - Operator: John Doe
     - Coefficients: [displayed]
     - Deviation: 2.34% ✓
     - Time: 2025-10-12 14:30:00
   • Click "Save Calibration"
   • ✓ Saved to database
   • Wizard resets
```

## Step-by-Step Screenshots (Text Representation)

### Step 1: Prepare
```
┌────────────────────────────────────────────────┐
│  Step 1: Prepare Standard Test Block          │
│                                                │
│  Please place the standard test block and     │
│  fill in the following information.           │
│                                                │
│  Standard Block ID *                           │
│  ┌──────────────────────────────────────────┐ │
│  │ STD-001                                  │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Operator *                                    │
│  ┌──────────────────────────────────────────┐ │
│  │ John Doe                                 │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Notes (Optional)                              │
│  ┌──────────────────────────────────────────┐ │
│  │ Monthly calibration check                │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│         [Cancel]  [Start Calibration]          │
└────────────────────────────────────────────────┘
```

### Step 2: Capture
```
┌────────────────────────────────────────────────┐
│  Step 2: Capture Reference Signal             │
│                                                │
│  Click the button below to start capturing    │
│  the reference signal from the standard block.│
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ✓ Signal captured successfully          │ │
│  │  Captured 1000 data points                │ │
│  │                                            │ │
│  │  Avg Amplitude: 0.6366                    │ │
│  │  Max Amplitude: 0.9987                    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│         [Back]  [Next]                         │
└────────────────────────────────────────────────┘
```

### Step 3: Calculate
```
┌────────────────────────────────────────────────┐
│  Step 3: Calculate Calibration Coefficients   │
│                                                │
│  The system will calculate calibration        │
│  coefficients based on the reference signal.  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ✓ Calculation completed                  │ │
│  │                                            │ │
│  │  Gain Correction:     1.5708              │ │
│  │  Phase Correction:   -0.0234 rad          │ │
│  │  Offset Correction:  -0.0012              │ │
│  │                                            │ │
│  │  Deviation: 2.34% ✓                       │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│         [Back]  [Next]                         │
└────────────────────────────────────────────────┘
```

### Step 4: Complete
```
┌────────────────────────────────────────────────┐
│  Step 4: Calibration Complete                 │
│                                                │
│  Calibration completed successfully.          │
│  Please review the results and save.          │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Standard Block:    STD-001               │ │
│  │  Operator:          John Doe              │ │
│  │  Gain Correction:   1.5708                │ │
│  │  Phase Correction: -0.0234 rad            │ │
│  │  Offset Correction: -0.0012               │ │
│  │  Deviation:         2.34% ✓               │ │
│  │  Time:              2025-10-12 14:30:00   │ │
│  │  Notes:             Monthly calibration   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│      [Recalibrate]  [Save Calibration]         │
└────────────────────────────────────────────────┘
```

## Error Scenarios

### Missing Required Fields
```
┌────────────────────────────────────────────────┐
│  ⚠ 请填写标准试块和操作员信息                    │
│     Please fill in standard block and          │
│     operator information                       │
└────────────────────────────────────────────────┘
```

### Excessive Deviation
```
┌────────────────────────────────────────────────┐
│  Step 3: Calculate Calibration Coefficients   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ✗ Calibration Failed                     │ │
│  │  Deviation: 7.82% (Max allowed: 5.00%)    │ │
│  │  Please check the standard block and      │ │
│  │  restart                                   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│         [Back]  [Restart]                      │
└────────────────────────────────────────────────┘
```

## Integration Example

### In Calibration Page
```svelte
<script lang="ts">
  import CalibrationWizard from '$lib/components/settings/CalibrationWizard.svelte';
  import { supabaseService } from '$lib/services/supabase';
  import type { CalibrationData } from '$lib/types';
  
  let recentCalibrations = $state<CalibrationData[]>([]);
  
  async function loadRecentCalibrations() {
    const calibrations = await supabaseService.getCalibrations();
    recentCalibrations = calibrations.slice(0, 5);
  }
  
  function handleCalibrationComplete(calibrationId: string) {
    console.log('Calibration saved:', calibrationId);
    loadRecentCalibrations(); // Refresh list
  }
  
  $effect(() => {
    loadRecentCalibrations();
  });
</script>

<div class="page">
  <h1>System Calibration</h1>
  
  <CalibrationWizard onComplete={handleCalibrationComplete} />
  
  {#if recentCalibrations.length > 0}
    <div class="recent">
      <h2>Recent Calibrations</h2>
      {#each recentCalibrations as cal}
        <div class="card">
          <span>{cal.standardBlock}</span>
          <span>{cal.calibrationDate.toLocaleString()}</span>
          <span class={cal.isActive ? 'active' : 'inactive'}>
            {cal.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

## Customization

### Custom Deviation Threshold
```svelte
<!-- In CalibrationWizard.svelte -->
<script>
  const MAX_DEVIATION = 0.03; // 3% instead of 5%
</script>
```

### Custom Expiry Period
```svelte
<!-- In CalibrationWizard.svelte -->
<script>
  // Change from 1 year to 6 months
  expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
</script>
```

### Custom Calibration Type
```svelte
<!-- In CalibrationWizard.svelte -->
<script>
  calibrationType: 'reference_signal' // or 'system_check', 'custom'
</script>
```

## Best Practices

1. **Always validate inputs** before proceeding to next step
2. **Show loading indicators** during async operations
3. **Provide clear error messages** with actionable guidance
4. **Auto-fill known information** (like operator name)
5. **Color-code status** (green for success, red for error)
6. **Allow users to go back** to previous steps
7. **Confirm before saving** with summary review
8. **Handle network failures** gracefully
9. **Log calibration events** for audit trail
10. **Set appropriate expiry dates** based on standards

## Troubleshooting

### Issue: Operator name not auto-filled
**Solution**: Ensure user is logged in and auth store is initialized

### Issue: Save fails with "User not logged in"
**Solution**: Check auth state before attempting save

### Issue: Deviation always exceeds threshold
**Solution**: Check signal generation algorithm and expected values

### Issue: Recent calibrations not loading
**Solution**: Verify Supabase connection and RLS policies

### Issue: Component not rendering
**Solution**: Check import path and component registration

## Performance Tips

1. Use `$effect` for reactive data loading
2. Debounce input validation
3. Lazy load calibration history
4. Cache recent calibrations
5. Optimize signal processing algorithms

## Accessibility

- All form inputs have labels
- Required fields marked with *
- Error messages announced to screen readers
- Keyboard navigation supported
- Focus indicators visible
- Color contrast meets WCAG AA standards

## Browser Support

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Responsive design

## Related Components

- `ParameterPanel.svelte` - For setting test parameters
- `GateSettings.svelte` - For configuring gates
- `DataTable.svelte` - For viewing calibration history

## API Reference

See `CALIBRATION_README.md` for detailed API documentation.
