# Data Components / 数据组件

This directory contains components for displaying and managing testing data in various formats.

## Components

### DataTable.svelte

A comprehensive data table component for displaying signal data with sorting, pagination, and highlighting features.

**Features:**
- Display signal data in tabular format
- Column sorting (click headers to sort)
- Pagination with configurable page size
- Row selection and highlighting
- Abnormal data highlighting (based on threshold)
- Responsive design for mobile devices
- Real-time data updates from testing store

**Props:**
```typescript
{
  data?: SignalData[];        // Optional data array (defaults to store data)
  pageSize?: number;          // Items per page (default: 20)
  showPagination?: boolean;   // Show pagination controls (default: true)
}
```

**Usage:**
```svelte
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import { testingStore } from '$lib/stores/testing';
</script>

<!-- Use with store data -->
<DataTable />

<!-- Use with custom data -->
<DataTable data={customSignalData} pageSize={50} />
```

**Columns:**
- 序号 (Index): Sequential number
- 位置 (Position): Time position in seconds
- 幅值 (Amplitude): Signal amplitude in volts
- 相位 (Phase): Signal phase in degrees
- 频率 (Frequency): Signal frequency in Hz
- 状态 (Status): Normal/Abnormal status

**Styling:**
- Industrial dark theme with orange accents
- Monospace font for numeric data
- Color-coded status badges
- Hover effects and smooth transitions
- Sticky table header for scrolling

## Future Components

### DataGrid.svelte
A more advanced grid component with:
- Column resizing
- Column reordering
- Advanced filtering
- Export functionality

### DataChart.svelte
Chart-based data visualization:
- Bar charts for amplitude distribution
- Scatter plots for position vs amplitude
- Histogram for statistical analysis

### DataExport.svelte
Export data in various formats:
- CSV export
- Excel export
- JSON export
- PDF report generation

## Design Principles

1. **Performance**: Efficient rendering with pagination and virtual scrolling
2. **Usability**: Intuitive sorting, filtering, and navigation
3. **Accessibility**: Keyboard navigation and screen reader support
4. **Consistency**: Matches industrial instrument design language
5. **Responsiveness**: Adapts to different screen sizes

## Related Files

- `src/lib/types/signal.ts` - Signal data type definitions
- `src/lib/stores/testing.ts` - Testing state management
- `src/lib/services/data-acquisition.ts` - Data acquisition service
