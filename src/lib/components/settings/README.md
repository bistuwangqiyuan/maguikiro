# Settings Components / 设置组件

This directory contains components related to system settings and parameter configuration.

## Components

### ParameterPanel

A comprehensive parameter settings panel for configuring testing parameters.

**Features:**
- Gain control (0-100 dB) with slider
- Filter type selection (lowpass, highpass, bandpass, none)
- Velocity input (0.1-10 m/s)
- Threshold control (0.1-10) with slider
- Real-time validation
- Parameter persistence to database
- Industrial-style UI matching DOPPLER branding

**Usage:**

```svelte
<script>
  import { ParameterPanel } from '$lib/components/settings';
  import { testingStore } from '$lib/stores/testing';
  
  $: isRunning = $testingStore.status === 'running';
</script>

<ParameterPanel disabled={isRunning} />
```

**Props:**
- `disabled` (boolean, optional): Disable all controls when testing is running

**Validation:**
- Gain: 0-100 dB
- Velocity: 0.1-10 m/s
- Threshold: 0.1-10
- All parameters validated in real-time
- Error messages displayed below invalid inputs

**Integration:**
- Reads parameters from `testingStore.currentSession.parameters`
- Updates parameters via `testingStore.updateParameters()`
- Automatically saves to Supabase database
- Parameters applied immediately to signal processor

## Styling

All components follow the industrial DOPPLER design system:
- Orange (#FF6B35) primary color
- Dark backgrounds (#1A1A1A, #2D2D2D)
- Roboto font family
- Roboto Mono for numeric values
- Responsive design for mobile/tablet/desktop

### GateSettings

A comprehensive gate configuration panel for Gate A and Gate B settings.

**Features:**
- Independent configuration for Gate A and Gate B
- Enable/disable toggle for each gate
- Start position input (seconds)
- Width input (0.1-10 seconds)
- Height input (0.1-10 amplitude units)
- Alarm threshold input (must be ≤ height)
- Color picker for gate visualization
- Real-time validation with error messages
- Apply and Save buttons
- Reset to defaults
- Industrial-style UI matching DOPPLER branding

**Usage:**

```svelte
<script>
  import { GateSettings } from '$lib/components/settings';
  
  function handleApply(event) {
    console.log('Gate settings applied:', event.detail);
  }
  
  function handleSave(event) {
    console.log('Gate settings saved:', event.detail);
  }
</script>

<GateSettings on:apply={handleApply} on:save={handleSave} />
```

**Events:**
- `apply`: Fired when "Apply" button is clicked (updates store, not saved to DB)
- `save`: Fired when "Save" button is clicked (updates store and saves to DB)

**Validation:**
- Start position: ≥ 0
- Width: 0.1-10 seconds
- Height: 0.1-10 amplitude units
- Alarm threshold: 0.1 to gate height
- All parameters validated in real-time
- Error messages displayed below invalid inputs

**Integration:**
- Reads gate parameters from `testingStore.currentSession.parameters.gateA/gateB`
- Updates parameters via `testingStore.updateParameters()`
- Automatically saves to Supabase database when "Save" is clicked
- Parameters applied immediately to waveform visualization

**Demo:**
See `/demo-gate-settings` for a live demonstration with waveform preview.

## Future Components

- CalibrationWizard: Step-by-step calibration process
- StandardPresets: Load international standard parameter sets
