# Report Export Service

## Overview

The Report Export Service provides a comprehensive solution for generating, exporting, storing, and managing PDF reports for magnetic testing sessions. It integrates the Report Generator with Supabase Storage and database operations.

## Features

- **PDF Generation**: Creates professional PDF reports using the Report Generator
- **Local Download**: Automatically triggers browser download of generated PDFs
- **Cloud Storage**: Uploads PDFs to Supabase Storage for persistent access
- **Database Integration**: Saves report metadata to the database
- **Report Management**: List, view, download, and delete reports
- **Batch Operations**: Generate multiple reports at once
- **Error Handling**: Graceful error handling with detailed error messages

## Usage

### Basic Report Generation and Export

```typescript
import { reportExportService } from '$lib/services';

// Generate and export a report
const result = await reportExportService.generateAndExportReport(
  'session-id-123',
  'operator-id-456',
  'John Doe',
  {
    standard: 'ASME',
    includeWaveform: true,
    includeDataTable: true,
    includeDefectDetails: true,
    uploadToStorage: true,
    downloadLocally: true,
    companyName: 'DOPPLER',
    equipmentModel: 'DOPPLER MT-2000'
  }
);

if (result.success) {
  console.log('Report generated:', result.reportId);
  console.log('PDF URL:', result.pdfUrl);
} else {
  console.error('Failed:', result.error);
}
```

### Download Existing Report

```typescript
// Download a previously generated report
await reportExportService.downloadExistingReport(
  'report-id-789',
  'custom-filename.pdf'
);
```

### Get Report List

```typescript
// Get all reports
const reports = await reportExportService.getReportList();

// Get reports with filters
const filteredReports = await reportExportService.getReportList({
  sessionId: 'session-id-123',
  standard: 'ASME',
  limit: 20
});

// Each report includes:
// - id, sessionId, projectName
// - standard, reportType
// - pdfUrl, generatedAt
// - operatorName
// - sessionStartTime, sessionStatus
// - content (metadata)
```

### Delete Report

```typescript
// Delete a report (removes PDF from storage and database record)
await reportExportService.deleteReport('report-id-789');
```

### Batch Export

```typescript
// Generate reports for multiple sessions
const results = await reportExportService.batchExportReports(
  ['session-1', 'session-2', 'session-3'],
  'operator-id',
  'John Doe',
  {
    standard: 'ISO',
    uploadToStorage: true,
    downloadLocally: false // Don't auto-download in batch mode
  }
);

// Check results
results.forEach(result => {
  if (result.success) {
    console.log('Generated:', result.reportId);
  } else {
    console.error('Failed:', result.error);
  }
});
```

### Regenerate Report

```typescript
// Regenerate an existing report with new options
const result = await reportExportService.regenerateReport(
  'report-id-789',
  'John Doe',
  {
    includeDefectDetails: true,
    downloadLocally: true
  }
);
```

## Export Options

```typescript
interface ReportExportOptions {
  // Report generation options
  standard?: 'ASME' | 'ISO' | 'EN' | 'ASTM' | 'custom';
  includeWaveform?: boolean;
  includeDataTable?: boolean;
  includeDefectDetails?: boolean;
  
  // Company branding
  companyName?: string;
  companyLogo?: string;
  
  // Equipment information
  equipmentModel?: string;
  equipmentSerial?: string;
  testLocation?: string;
  
  // Customer information
  customerName?: string;
  partNumber?: string;
  materialType?: string;
  
  // Export behavior
  uploadToStorage?: boolean;  // Default: true
  downloadLocally?: boolean;  // Default: true
  fileName?: string;          // Custom filename for download
}
```

## Report Metadata

The service automatically generates comprehensive metadata for each report:

```typescript
{
  projectInfo: {
    name: string;
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    status: string;
  },
  testInfo: {
    parameters: TestingParameters;
    standard: string;
    equipmentModel: string;
    equipmentSerial: string;
    testLocation: string;
  },
  results: {
    totalDataPoints: number;
    totalDefects: number;
    criticalDefects: number;
    highDefects: number;
    mediumDefects: number;
    lowDefects: number;
    averageAmplitude: number;
    maxAmplitude: number;
    minAmplitude: number;
  },
  defects: Array<{
    position: number;
    amplitude: number;
    severity: string;
    gateTriggered: string;
    timestamp: Date;
    notes?: string;
  }>,
  conclusion: string;
}
```

## Integration with UI

### Svelte Component Example

```svelte
<script lang="ts">
  import { reportExportService } from '$lib/services';
  import { authStore } from '$lib/stores/auth';
  
  let generating = $state(false);
  let reports = $state<any[]>([]);
  
  async function generateReport(sessionId: string) {
    const user = authStore.getUser();
    if (!user) return;
    
    generating = true;
    
    const result = await reportExportService.generateAndExportReport(
      sessionId,
      user.id,
      user.user_metadata?.full_name || 'Unknown',
      {
        standard: 'ASME',
        uploadToStorage: true,
        downloadLocally: true
      }
    );
    
    if (result.success) {
      alert('Report generated successfully!');
      await loadReports();
    } else {
      alert(`Failed: ${result.error}`);
    }
    
    generating = false;
  }
  
  async function loadReports() {
    reports = await reportExportService.getReportList({ limit: 50 });
  }
  
  async function downloadReport(reportId: string) {
    await reportExportService.downloadExistingReport(reportId);
  }
  
  function viewReport(report: any) {
    if (report.pdfUrl) {
      window.open(report.pdfUrl, '_blank');
    }
  }
</script>

<button onclick={() => generateReport('session-123')} disabled={generating}>
  {generating ? 'Generating...' : 'Generate Report'}
</button>

{#each reports as report}
  <div class="report-card">
    <h3>{report.projectName}</h3>
    <p>Generated: {new Date(report.generatedAt).toLocaleString()}</p>
    <button onclick={() => viewReport(report)}>View</button>
    <button onclick={() => downloadReport(report.id)}>Download</button>
  </div>
{/each}
```

## Storage Structure

Reports are stored in Supabase Storage with the following structure:

```
report-pdfs/
  ├── {report-id}/
  │   └── report.pdf
  ├── {report-id}/
  │   └── report.pdf
  └── ...
```

Each report gets its own folder identified by the report ID, making it easy to manage and delete reports.

## Error Handling

The service handles errors gracefully:

```typescript
const result = await reportExportService.generateAndExportReport(...);

if (!result.success) {
  // Handle error
  console.error('Error:', result.error);
  
  // Common errors:
  // - "Session not found"
  // - "Failed to generate PDF"
  // - "Failed to upload to storage"
  // - "Failed to save report metadata"
}
```

## Performance Considerations

### PDF Generation
- Waveform capture may take 1-2 seconds for complex charts
- Large datasets are automatically limited (e.g., max 20 defects in detail table)
- Generation is asynchronous and non-blocking

### Storage Upload
- PDFs are uploaded to Supabase Storage after generation
- Upload failures don't prevent local download
- Typical upload time: 1-3 seconds for standard reports

### Batch Operations
- Batch exports process sequentially to avoid overwhelming the system
- Consider implementing progress tracking for large batches
- Auto-download is disabled in batch mode to prevent browser popup issues

## Security

### Row Level Security (RLS)
- Users can only view reports for their own sessions
- Engineers and admins can view all reports
- Report deletion requires appropriate permissions

### Storage Access
- PDFs are stored in a private bucket
- Access requires authentication
- Public URLs are generated but require valid session

## Best Practices

### 1. Always Check User Authentication
```typescript
const user = authStore.getUser();
if (!user) {
  throw new Error('User not authenticated');
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  const result = await reportExportService.generateAndExportReport(...);
  if (!result.success) {
    // Show user-friendly error message
    showError(result.error);
  }
} catch (error) {
  // Handle unexpected errors
  showError('An unexpected error occurred');
}
```

### 3. Provide User Feedback
```typescript
// Show loading state
generating = true;

// Generate report
const result = await reportExportService.generateAndExportReport(...);

// Show success/error message
if (result.success) {
  showSuccess('Report generated successfully!');
} else {
  showError(result.error);
}

// Hide loading state
generating = false;
```

### 4. Refresh Report List After Operations
```typescript
// After generating a report
await reportExportService.generateAndExportReport(...);
await loadReports(); // Refresh the list

// After deleting a report
await reportExportService.deleteReport(reportId);
await loadReports(); // Refresh the list
```

## Troubleshooting

### Report Generation Fails
- Check that the session exists and has data
- Verify user has permission to access the session
- Ensure waveform chart element exists in DOM (if includeWaveform is true)

### Upload to Storage Fails
- Verify Supabase Storage bucket 'report-pdfs' exists
- Check storage RLS policies allow uploads
- Ensure user is authenticated

### Download Doesn't Work
- Check browser popup blocker settings
- Verify PDF exists in storage
- Ensure report has a valid pdfUrl

### Report List is Empty
- Verify user has generated reports
- Check RLS policies allow reading reports
- Ensure database connection is working

## Future Enhancements

- [ ] Report templates customization
- [ ] Email report delivery
- [ ] Report scheduling
- [ ] Report comparison features
- [ ] Multi-language report generation
- [ ] Digital signature integration
- [ ] Report versioning
- [ ] Bulk download as ZIP

## Dependencies

- `report-generator.ts` - PDF generation
- `supabase.ts` - Database and storage operations
- `report-templates.ts` - Report template definitions
- `jsPDF` - PDF library
- `html2canvas` - Screenshot capture

## License

Part of the Magnetic Testing Instrument application.
