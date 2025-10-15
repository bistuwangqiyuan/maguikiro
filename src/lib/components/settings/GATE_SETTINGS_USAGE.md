# GateSettings Component - Usage Guide

## Quick Start

```svelte
<script>
  import GateSettings from '$lib/components/settings/GateSettings.svelte';
</script>

<GateSettings />
```

## With Event Handlers

```svelte
<script>
  import GateSettings from '$lib/components/settings/GateSettings.svelte';
  import { testingStore } from '$lib/stores/testing';
  
  function handleApply(event) {
    const { gateA, gateB } = event.detail;
    console.log('Gate settings applied:', { gateA, gateB });
    // Parameters are already updated in the store
    // Waveform will update automatically
  }
  
  function handleSave(event) {
    const { gateA, gateB } = event.detail;
    console.log('Gate settings saved:', { gateA, gateB });
    // Parameters are saved to database
    showSuccessNotification('Gate settings saved successfully');
  }
</script>

<GateSettings on:apply={handleApply} on:save={handleSave} />
```

## In a Modal/Dialog

```svelte
<script>
  import GateSettings from '$lib/components/settings/GateSettings.svelte';
  
  let showModal = false;
  
  function handleSave(event) {
    showModal = false;
    showNotification('Settings saved');
  }
</script>

<button on:click={() => showModal = true}>
  Configure Gates
</button>

{#if showModal}
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl">
      <h3 class="font-bold text-lg mb-4">Gate Settings</h3>
      <GateSettings on:save={handleSave} />
      <div class="modal-action">
        <button class="btn" on:click={() => showModal = false}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
```

## With Waveform Preview

```svelte
<script>
  import GateSettings from '$lib/components/settings/GateSettings.svelte';
  import WaveformWithGates from '$lib/components/waveform/WaveformWithGates.svelte';
  import { testingStore } from '$lib/stores/testing';
  
  $: gateA = $testingStore.currentSession?.parameters.gateA;
  $: gateB = $testingStore.currentSession?.parameters.gateB;
</script>

<div class="grid grid-cols-2 gap-4">
  <div>
    <h2>Settings</h2>
    <GateSettings />
  </div>
  <div>
    <h2>Preview</h2>
    {#if gateA && gateB}
      <WaveformWithGates {gateA} {gateB} />
    {/if}
  </div>
</div>
```

## In a Settings Page

```svelte
<!-- src/routes/settings/gates/+page.svelte -->
<script>
  import GateSettings from '$lib/components/settings/GateSettings.svelte';
  import { goto } from '$app/navigation';
  
  function handleSave() {
    goto('/'); // Return to main page after saving
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">Gate Configuration</h1>
  <GateSettings on:save={handleSave} />
</div>
```

## Accessing Gate Values

```svelte
<script>
  import { testingStore } from '$lib/stores/testing';
  
  // Read current gate configuration
  $: currentGateA = $testingStore.currentSession?.parameters.gateA;
  $: currentGateB = $testingStore.currentSession?.parameters.gateB;
  
  // Check if gates are enabled
  $: gateAEnabled = currentGateA?.enabled ?? false;
  $: gateBEnabled = currentGateB?.enabled ?? false;
  
  // Get specific values
  $: gateAStart = currentGateA?.start ?? 0;
  $: gateAWidth = currentGateA?.width ?? 1.0;
</script>

<div>
  <p>Gate A: {gateAEnabled ? 'Enabled' : 'Disabled'}</p>
  <p>Gate A Range: {gateAStart}s - {gateAStart + gateAWidth}s</p>
</div>
```

## Programmatic Updates

```svelte
<script>
  import { testingStore } from '$lib/stores/testing';
  
  async function setGateAToDefaults() {
    await testingStore.updateParameters({
      gateA: {
        enabled: true,
        start: 0,
        width: 1.0,
        height: 5.0,
        alarmThreshold: 1.5,
        color: '#FFD700'
      }
    });
  }
  
  async function disableAllGates() {
    const current = $testingStore.currentSession?.parameters;
    if (current) {
      await testingStore.updateParameters({
        gateA: { ...current.gateA, enabled: false },
        gateB: { ...current.gateB, enabled: false }
      });
    }
  }
</script>

<button on:click={setGateAToDefaults}>Reset Gate A</button>
<button on:click={disableAllGates}>Disable All Gates</button>
```

## Validation Example

```svelte
<script>
  import type { GateConfig } from '$lib/types/signal';
  
  function validateGateConfig(gate: GateConfig): string[] {
    const errors: string[] = [];
    
    if (gate.start < 0) {
      errors.push('Start position must be non-negative');
    }
    
    if (gate.width <= 0 || gate.width > 10) {
      errors.push('Width must be between 0.1 and 10 seconds');
    }
    
    if (gate.height <= 0 || gate.height > 10) {
      errors.push('Height must be between 0.1 and 10 units');
    }
    
    if (gate.alarmThreshold > gate.height) {
      errors.push('Alarm threshold cannot exceed gate height');
    }
    
    return errors;
  }
  
  function handleApply(event) {
    const { gateA, gateB } = event.detail;
    
    const errorsA = validateGateConfig(gateA);
    const errorsB = validateGateConfig(gateB);
    
    if (errorsA.length > 0 || errorsB.length > 0) {
      console.error('Validation errors:', { errorsA, errorsB });
      return;
    }
    
    // Proceed with valid configuration
    console.log('Valid configuration applied');
  }
</script>
```

## Custom Styling

```svelte
<script>
  import GateSettings from '$lib/components/settings/GateSettings.svelte';
</script>

<div class="custom-gate-settings">
  <GateSettings />
</div>

<style>
  .custom-gate-settings {
    /* Override component styles if needed */
    --primary-orange: #FF8C00; /* Custom orange */
    --bg-dark: #000000; /* Darker background */
  }
  
  .custom-gate-settings :global(.gate-settings) {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
```

## Integration with Navigation

```svelte
<script>
  import GateSettings from '$lib/components/settings/GateSettings.svelte';
  import { goto } from '$app/navigation';
  
  let hasUnsavedChanges = false;
  
  function handleApply() {
    hasUnsavedChanges = true;
  }
  
  function handleSave() {
    hasUnsavedChanges = false;
  }
  
  function handleBack() {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        goto('/');
      }
    } else {
      goto('/');
    }
  }
</script>

<div>
  <button on:click={handleBack}>← Back</button>
  <GateSettings on:apply={handleApply} on:save={handleSave} />
</div>
```

## Best Practices

### 1. Always Handle Events

```svelte
<!-- ✅ Good -->
<GateSettings on:apply={handleApply} on:save={handleSave} />

<!-- ❌ Avoid - Events not handled -->
<GateSettings />
```

### 2. Provide User Feedback

```svelte
<script>
  let notification = '';
  
  function handleSave() {
    notification = 'Settings saved successfully!';
    setTimeout(() => notification = '', 3000);
  }
</script>

<GateSettings on:save={handleSave} />
{#if notification}
  <div class="alert alert-success">{notification}</div>
{/if}
```

### 3. Check for Active Session

```svelte
<script>
  import { testingStore } from '$lib/stores/testing';
  
  $: hasSession = $testingStore.currentSession !== null;
  $: isRunning = $testingStore.status === 'running';
</script>

{#if !hasSession}
  <p>Please start a testing session first.</p>
{:else if isRunning}
  <p class="warning">Cannot modify gates while testing is running.</p>
  <GateSettings disabled />
{:else}
  <GateSettings />
{/if}
```

### 4. Validate Before Critical Operations

```svelte
<script>
  function handleSave(event) {
    const { gateA, gateB } = event.detail;
    
    // Validate gates don't overlap
    if (gateA.enabled && gateB.enabled) {
      const aEnd = gateA.start + gateA.width;
      const bEnd = gateB.start + gateB.width;
      
      if ((gateA.start < bEnd && aEnd > gateB.start)) {
        alert('Warning: Gates overlap!');
        return;
      }
    }
    
    // Proceed with save
    console.log('Gates saved');
  }
</script>
```

## Common Patterns

### Pattern 1: Settings Wizard

```svelte
<script>
  let step = 1;
  
  function nextStep() {
    step++;
  }
</script>

{#if step === 1}
  <h2>Step 1: Configure Gate A</h2>
  <!-- Gate A configuration -->
{:else if step === 2}
  <h2>Step 2: Configure Gate B</h2>
  <!-- Gate B configuration -->
{:else}
  <h2>Step 3: Review and Save</h2>
  <GateSettings on:save={() => goto('/complete')} />
{/if}
```

### Pattern 2: Preset Management

```svelte
<script>
  const presets = {
    standard: {
      gateA: { enabled: true, start: 0, width: 1.0, height: 5.0, alarmThreshold: 1.5, color: '#FFD700' },
      gateB: { enabled: true, start: 1.0, width: 1.0, height: 5.0, alarmThreshold: 2.0, color: '#FF69B4' }
    },
    sensitive: {
      gateA: { enabled: true, start: 0, width: 0.5, height: 3.0, alarmThreshold: 1.0, color: '#FFD700' },
      gateB: { enabled: true, start: 0.5, width: 0.5, height: 3.0, alarmThreshold: 1.0, color: '#FF69B4' }
    }
  };
  
  async function loadPreset(name: keyof typeof presets) {
    await testingStore.updateParameters(presets[name]);
  }
</script>

<select on:change={(e) => loadPreset(e.target.value)}>
  <option value="">Select Preset</option>
  <option value="standard">Standard</option>
  <option value="sensitive">Sensitive</option>
</select>

<GateSettings />
```

## Troubleshooting

### Issue: Settings not persisting
**Solution**: Ensure you're calling the `save` event handler and the testing session exists.

### Issue: Waveform not updating
**Solution**: Verify that WaveformWithGates is receiving the updated gate configs from the store.

### Issue: Validation errors not showing
**Solution**: Check that error messages are being set in the component's validation logic.

### Issue: Colors not applying
**Solution**: Ensure color values are valid hex codes (e.g., #FFD700).

## API Reference

### Events

#### `apply`
Fired when the Apply button is clicked.
```typescript
event.detail: {
  gateA: GateConfig;
  gateB: GateConfig;
}
```

#### `save`
Fired when the Save button is clicked.
```typescript
event.detail: {
  gateA: GateConfig;
  gateB: GateConfig;
}
```

### GateConfig Interface

```typescript
interface GateConfig {
  enabled: boolean;        // Gate enable/disable state
  start: number;          // Start position in seconds (≥ 0)
  width: number;          // Width in seconds (0.1-10)
  height: number;         // Height in amplitude units (0.1-10)
  alarmThreshold: number; // Alarm threshold (0.1 to height)
  color: string;          // Hex color code (e.g., '#FFD700')
}
```

## Related Components

- `WaveformWithGates` - Displays waveform with gate overlays
- `GateOverlay` - Renders gate boundaries on waveform
- `ParameterPanel` - General parameter configuration
- `testingStore` - State management for testing session

## Demo

Visit `/demo-gate-settings` for a live demonstration with:
- Interactive gate configuration
- Real-time waveform preview
- Validation examples
- Usage instructions
