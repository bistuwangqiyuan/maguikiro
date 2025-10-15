# DataTable Component - Usage Guide

## Quick Start

### Basic Usage
Display data from the testing store automatically:

```svelte
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
</script>

<DataTable />
```

### Custom Configuration
Configure page size and pagination:

```svelte
<DataTable pageSize={25} showPagination={true} />
```

### With Custom Data
Display historical or custom data:

```svelte
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import type { SignalData } from '$lib/types/signal';
  
  let historicalData: SignalData[] = [
    // ... your data
  ];
</script>

<DataTable data={historicalData} pageSize={50} />
```

## Integration Examples

### In Main Testing Page
Combine with waveform display:

```svelte
<script>
  import WaveformChart from '$lib/components/waveform/WaveformChart.svelte';
  import DataTable from '$lib/components/data/DataTable.svelte';
</script>

<div class="testing-display">
  <div class="waveform-section">
    <WaveformChart />
  </div>
  
  <div class="data-section">
    <DataTable pageSize={15} />
  </div>
</div>

<style>
  .testing-display {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    height: 100%;
  }
  
  .waveform-section,
  .data-section {
    min-height: 0; /* Important for scrolling */
  }
</style>
```

### In History Page
Display historical session data:

```svelte
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import { testingStore } from '$lib/stores/testing';
  
  let sessionId = 'some-session-id';
  
  async function loadSession() {
    await testingStore.loadSession(sessionId);
  }
  
  $: sessionData = $testingStore.processedBuffer;
</script>

<button on:click={loadSession}>Load Session</button>

{#if sessionData.length > 0}
  <DataTable data={sessionData} pageSize={30} />
{:else}
  <p>No data available</p>
{/if}
```

### In Modal/Dialog
Display data in a popup:

```svelte
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import type { SignalData } from '$lib/types/signal';
  
  export let isOpen = false;
  export let data: SignalData[] = [];
</script>

{#if isOpen}
  <div class="modal">
    <div class="modal-content">
      <h2>Signal Data Details</h2>
      <div class="table-container">
        <DataTable {data} pageSize={20} />
      </div>
      <button on:click={() => isOpen = false}>Close</button>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: var(--bg-dark);
    padding: 2rem;
    border-radius: 0.5rem;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .table-container {
    flex: 1;
    min-height: 0;
    margin: 1rem 0;
  }
</style>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `SignalData[]` | `[]` | Optional data array. If not provided, uses testing store data |
| `pageSize` | `number` | `20` | Number of rows per page |
| `showPagination` | `boolean` | `true` | Show/hide pagination controls |

## Features

### Sorting
- Click any column header to sort
- Click again to reverse sort direction
- Visual indicator (▲/▼) shows current sort

### Pagination
- Automatic pagination when data exceeds page size
- Previous/Next buttons
- Direct page number navigation
- Smart ellipsis for large page counts

### Row Selection
- Click any row to select it
- Selected row is highlighted with orange border
- Use for detail views or actions

### Abnormal Detection
- Automatically detects abnormal data based on threshold
- Red background tint for abnormal rows
- Red status badge
- Count displayed in table info

## Styling Customization

### Override Colors
```svelte
<DataTable />

<style>
  :global(.data-table-container) {
    --primary-orange: #your-color;
    --bg-dark: #your-color;
    --text-primary: #your-color;
  }
</style>
```

### Custom Height
```svelte
<div class="custom-container">
  <DataTable />
</div>

<style>
  .custom-container {
    height: 400px;
  }
  
  .custom-container :global(.data-table-container) {
    height: 100%;
  }
</style>
```

## Events (Future Enhancement)

Currently, the component doesn't emit custom events, but you can extend it:

```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  function handleRowClick(index: number) {
    selectedIndex = index;
    dispatch('rowSelect', { index, data: paginatedData[index] });
  }
</script>
```

## Performance Tips

1. **Large Datasets**: Use pagination with smaller page sizes (10-20 rows)
2. **Real-time Updates**: Component automatically updates when store changes
3. **Memory**: Component only renders visible page data
4. **Sorting**: Sorting is done in-memory, very fast for typical datasets

## Accessibility

- Semantic HTML table structure
- Sortable columns are keyboard accessible
- High contrast colors for readability
- Status badges use color + text for clarity

## Common Issues

### Data Not Showing
- Ensure testing session is started
- Check that processedBuffer has data
- Verify data prop is passed correctly

### Sorting Not Working
- Ensure data has the expected properties
- Check console for errors
- Verify column names match SignalData interface

### Pagination Issues
- Check that pageSize is a positive number
- Ensure totalPages calculation is correct
- Verify data length is greater than pageSize

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Related Components

- `WaveformChart.svelte` - Display data as waveform
- `SignalMarker.svelte` - Mark defects on waveform
- `ParameterPanel.svelte` - Configure detection parameters

## Next Steps

After integrating DataTable:
1. Add to main testing page
2. Add to history page
3. Implement detail view on row selection
4. Add export functionality
5. Consider adding filters

## Support

For issues or questions:
- Check the README.md in this directory
- Review the demo page at `/demo-data-table`
- Check the verification document for testing checklist
