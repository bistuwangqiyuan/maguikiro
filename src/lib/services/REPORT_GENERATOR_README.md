# Report Generator Service

## Overview

The Report Generator Service provides comprehensive PDF report generation functionality for magnetic testing sessions. It uses jsPDF and html2canvas to create professional, standards-compliant reports.

## Features

- **PDF Generation**: Creates A4-sized PDF reports with proper formatting
- **Multiple Standards**: Supports ASME, ISO, EN, ASTM, and custom standards
- **Comprehensive Content**:
  - Report header with company branding
  - Project and test information
  - Testing parameters table
  - Waveform screenshot capture
  - Data summary statistics
  - Defect analysis and details
  - Automated conclusions and recommendations
  - Signature sections
- **Automatic Pagination**: Handles page breaks intelligently
- **Configurable Output**: Flexible configuration options

## Usage

### Basic Usage

```typescript
import { createReportGenerator } from '$lib/services';
import type { CompleteSessionData } from '$lib/types';

// Create generator instance
const generator = createReportGenerator();

// Generate report
const pdfBlob = await generator.generateReport(
  sessionData,
  'John Doe', // operator name
  {
    standard: 'ASME',
    includeWaveform: true,
    includeDataTable: true,
    includeDefectDetails: true,
    companyName: 'DOPPLER',
    companyLogo: '/assets/logo.png'
  }
);

// Download the PDF
const url = URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = `report-${sessionData.id}.pdf`;
link.click();
URL.revokeObjectURL(url);
```

### Configuration Options

```typescript
interface ReportGenerationConfig {
  // International standard to use
  standard?: 'ASME' | 'ISO' | 'EN' | 'ASTM' | 'custom';
  
  // Include waveform screenshot
  includeWaveform?: boolean;
  
  // Include data table summary
  includeDataTable?: boolean;
  
  // Include detailed defect table
  includeDefectDetails?: boolean;
  
  // Company branding
  companyLogo?: string;
  companyName?: string;
  
  // Operator signature image
  operatorSignature?: string;
}
```

## Report Structure

### 1. Header Section
- Company name and logo
- Report title
- Standard reference
- Horizontal separator

### 2. Test Information
- Project name
- Test date and time
- Operator name
- Session ID
- Test status
- Duration

### 3. Testing Parameters
Formatted table showing:
- Gain (dB)
- Filter type
- Velocity (mm/s)
- Threshold
- Gate A configuration (start, width, threshold)
- Gate B configuration (start, width, threshold)

### 4. Waveform Display
- Screenshot of the waveform chart
- Automatically captured from DOM element with id `waveform-chart`
- High-resolution capture (2x scale)

### 5. Data Summary
Statistics including:
- Total data points
- Average amplitude
- Maximum amplitude
- Minimum amplitude
- Position range

### 6. Defect Analysis
- Total defect count
- Breakdown by severity (Critical, High, Medium, Low)
- Detailed defect table (up to 20 defects)
  - Position
  - Amplitude
  - Severity
  - Gate triggered

### 7. Conclusion
Automated conclusion based on defect analysis:
- **REJECT**: Critical defects detected
- **CONDITIONAL**: High-severity defects detected
- **ACCEPT WITH NOTES**: Minor defects within limits
- **ACCEPT**: No defects detected

Includes recommendations for each case.

### 8. Signatures
- Operator signature line
- Inspector signature line
- Date

## Standards Support

### ASME Section V, Article 7
Magnetic Particle Testing standard with specific parameter requirements.

### ISO 9712
Non-destructive Testing personnel qualification standard.

### EN 10228
Non-destructive Testing of Steel Forgings standard.

### ASTM E709
Standard Guide for Magnetic Particle Testing.

### Custom
Allows for custom standard specifications.

## Technical Details

### PDF Specifications
- **Format**: A4 (210mm x 297mm)
- **Orientation**: Portrait
- **Margins**: 15mm
- **Font**: Helvetica
- **Line Height**: 7mm

### Waveform Capture
The service attempts to capture a screenshot of the waveform chart by:
1. Finding DOM element with id `waveform-chart`
2. Using html2canvas to render it
3. Converting to PNG image
4. Embedding in PDF

**Note**: The waveform chart element must be visible in the DOM when generating the report.

### Page Management
- Automatic page breaks when content exceeds page height
- Maintains consistent margins and formatting across pages
- Intelligent spacing to avoid orphaned content

## Error Handling

The service handles errors gracefully:
- Missing waveform element: Logs warning and continues without screenshot
- Canvas capture failure: Logs error and continues with other content
- Empty data: Handles edge cases with zero defects or data points

## Performance Considerations

- **Waveform Capture**: May take 1-2 seconds for high-resolution charts
- **Large Datasets**: Defect table limited to 20 entries to prevent excessive pages
- **Memory**: PDF generation is memory-efficient, suitable for browser environments

## Integration with Supabase

After generating the PDF, you can upload it to Supabase Storage:

```typescript
import { supabaseService } from '$lib/services';

// Generate report
const pdfBlob = await generator.generateReport(sessionData, operatorName, config);

// Upload to Supabase Storage
const fileName = `report-${sessionData.id}-${Date.now()}.pdf`;
const { data, error } = await supabaseService.getClient()
  .storage
  .from('reports')
  .upload(fileName, pdfBlob, {
    contentType: 'application/pdf',
    upsert: false
  });

if (data) {
  // Get public URL
  const { data: urlData } = supabaseService.getClient()
    .storage
    .from('reports')
    .getPublicUrl(fileName);
  
  // Save report metadata to database
  await supabaseService.saveReport({
    sessionId: sessionData.id,
    reportType: 'standard',
    standard: config.standard,
    pdfUrl: urlData.publicUrl,
    generatedBy: operatorId,
    generatedAt: new Date(),
    content: {
      projectInfo: { name: sessionData.projectName },
      testInfo: { date: sessionData.startTime, operator: operatorName },
      results: {
        totalDefects: sessionData.defects.length,
        criticalDefects: sessionData.defects.filter(d => d.severity === 'critical').length,
        summary: 'Report generated successfully'
      },
      defects: sessionData.defects,
      conclusion: 'See PDF for details'
    }
  });
}
```

## Example: Complete Report Generation Flow

```typescript
import { createReportGenerator, supabaseService } from '$lib/services';
import { testingStore } from '$lib/stores';
import { get } from 'svelte/store';

async function generateAndSaveReport() {
  try {
    // Get current session data
    const session = get(testingStore).currentSession;
    if (!session) {
      throw new Error('No active session');
    }
    
    // Fetch complete session data with signals and defects
    const completeData = await supabaseService.getCompleteSessionData(session.id);
    
    // Generate PDF
    const generator = createReportGenerator();
    const pdfBlob = await generator.generateReport(
      completeData,
      'John Doe',
      {
        standard: 'ASME',
        includeWaveform: true,
        includeDataTable: true,
        includeDefectDetails: true,
        companyName: 'DOPPLER'
      }
    );
    
    // Upload to Supabase
    const fileName = `report-${session.id}-${Date.now()}.pdf`;
    const { data, error } = await supabaseService.getClient()
      .storage
      .from('reports')
      .upload(fileName, pdfBlob);
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabaseService.getClient()
      .storage
      .from('reports')
      .getPublicUrl(fileName);
    
    // Save metadata
    await supabaseService.saveReport({
      sessionId: session.id,
      reportType: 'standard',
      standard: 'ASME',
      pdfUrl: urlData.publicUrl,
      generatedBy: session.operatorId,
      generatedAt: new Date(),
      content: {
        projectInfo: { name: session.projectName },
        testInfo: { 
          date: session.startTime, 
          operator: 'John Doe',
          parameters: session.parameters
        },
        results: {
          totalDefects: completeData.defects.length,
          criticalDefects: completeData.defects.filter(d => d.severity === 'critical').length,
          summary: 'Testing completed successfully'
        },
        defects: completeData.defects.map(d => ({
          position: d.position,
          severity: d.severity,
          description: `Amplitude: ${d.amplitude}`
        })),
        conclusion: 'See PDF for detailed analysis'
      }
    });
    
    console.log('Report generated and saved successfully');
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
}
```

## Customization

### Custom Company Logo

To add a company logo, provide the logo URL in the config:

```typescript
const pdfBlob = await generator.generateReport(sessionData, operatorName, {
  companyLogo: '/assets/company-logo.png'
});
```

Note: Logo rendering is not yet implemented in the current version but the config option is available for future enhancement.

### Custom Conclusions

The conclusion is automatically generated based on defect severity. To customize, you can extend the `ReportGenerator` class:

```typescript
class CustomReportGenerator extends ReportGenerator {
  protected addConclusion(session: CompleteSessionData, config: ReportGenerationConfig): void {
    // Your custom conclusion logic
  }
}
```

## Future Enhancements

- [ ] Logo image embedding
- [ ] Digital signature support
- [ ] Multiple language support
- [ ] Custom report templates
- [ ] Batch report generation
- [ ] Report comparison features
- [ ] QR code for report verification

## Dependencies

- **jsPDF**: ^3.0.3 - PDF generation library
- **html2canvas**: ^1.4.1 - HTML to canvas conversion for screenshots

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may have minor rendering differences)
- Mobile browsers: Supported but waveform capture may be slower

## Troubleshooting

### Waveform not appearing in report
- Ensure the element with id `waveform-chart` exists in the DOM
- Make sure the chart is visible (not hidden or in a collapsed section)
- Check browser console for capture errors

### PDF download not working
- Check browser popup blocker settings
- Verify blob URL creation is successful
- Ensure sufficient browser memory for PDF generation

### Missing defects in report
- Verify `session.defects` array is populated
- Check that defects have required fields (position, amplitude, severity)
- Ensure defect data is loaded before generating report

## License

Part of the Magnetic Testing Instrument application.
