/**
 * Report Generator Example Usage
 * 
 * This file demonstrates how to use the ReportGenerator service
 * to create PDF reports from testing session data.
 */

import { createReportGenerator } from '../report-generator';
import type { CompleteSessionData, ReportGenerationConfig } from '$lib/types';

/**
 * Example 1: Basic Report Generation
 */
export async function basicReportExample() {
  // Sample session data
  const sessionData: CompleteSessionData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    projectName: 'Pipeline Inspection - Section A',
    operatorId: 'user-123',
    startTime: new Date('2025-10-12T08:00:00'),
    endTime: new Date('2025-10-12T09:30:00'),
    status: 'completed',
    parameters: {
      gain: 65,
      filter: 'bandpass',
      velocity: 150,
      threshold: 0.5,
      gateA: {
        enabled: true,
        start: 10,
        width: 50,
        height: 100,
        alarmThreshold: 0.7,
        color: '#FFD700'
      },
      gateB: {
        enabled: true,
        start: 70,
        width: 40,
        height: 100,
        alarmThreshold: 0.8,
        color: '#FF69B4'
      }
    },
    metadata: {},
    createdAt: new Date('2025-10-12T08:00:00'),
    updatedAt: new Date('2025-10-12T09:30:00'),
    signalData: [
      { timestamp: 1000, amplitude: 0.5, phase: 0, position: 10, frequency: 100 },
      { timestamp: 1010, amplitude: 0.6, phase: 0.1, position: 11, frequency: 100 },
      { timestamp: 1020, amplitude: 0.8, phase: 0.2, position: 12, frequency: 100 },
      // ... more data points
    ],
    defects: [
      {
        id: 'defect-1',
        position: 25.5,
        amplitude: 0.85,
        severity: 'medium',
        gateTriggered: 'A',
        timestamp: new Date('2025-10-12T08:15:00')
      },
      {
        id: 'defect-2',
        position: 78.2,
        amplitude: 0.92,
        severity: 'high',
        gateTriggered: 'B',
        timestamp: new Date('2025-10-12T08:45:00')
      }
    ]
  };

  // Create generator
  const generator = createReportGenerator();

  // Generate report
  const pdfBlob = await generator.generateReport(
    sessionData,
    'John Smith',
    {
      standard: 'ASME',
      companyName: 'DOPPLER'
    }
  );

  // Download the PDF
  downloadPDF(pdfBlob, `report-${sessionData.id}.pdf`);
}

/**
 * Example 2: Report with Custom Configuration
 */
export async function customConfigReportExample() {
  const sessionData: CompleteSessionData = {
    // ... session data
  } as CompleteSessionData;

  const config: ReportGenerationConfig = {
    standard: 'ISO',
    includeWaveform: true,
    includeDataTable: true,
    includeDefectDetails: true,
    companyName: 'DOPPLER Magnetic Testing',
    companyLogo: '/assets/logo.png'
  };

  const generator = createReportGenerator();
  const pdfBlob = await generator.generateReport(
    sessionData,
    'Jane Doe',
    config
  );

  downloadPDF(pdfBlob, 'custom-report.pdf');
}

/**
 * Example 3: Report Without Waveform
 * Useful when generating reports in background or when chart is not available
 */
export async function reportWithoutWaveformExample() {
  const sessionData: CompleteSessionData = {
    // ... session data
  } as CompleteSessionData;

  const generator = createReportGenerator();
  const pdfBlob = await generator.generateReport(
    sessionData,
    'Bob Johnson',
    {
      standard: 'ASTM',
      includeWaveform: false, // Skip waveform screenshot
      includeDataTable: true,
      includeDefectDetails: true
    }
  );

  downloadPDF(pdfBlob, 'report-no-waveform.pdf');
}

/**
 * Example 4: Minimal Report (Summary Only)
 */
export async function minimalReportExample() {
  const sessionData: CompleteSessionData = {
    // ... session data
  } as CompleteSessionData;

  const generator = createReportGenerator();
  const pdfBlob = await generator.generateReport(
    sessionData,
    'Alice Williams',
    {
      standard: 'EN',
      includeWaveform: false,
      includeDataTable: false,
      includeDefectDetails: false // Only show defect statistics, not details
    }
  );

  downloadPDF(pdfBlob, 'minimal-report.pdf');
}

/**
 * Example 5: Generate and Upload to Supabase
 */
export async function generateAndUploadExample(
  sessionData: CompleteSessionData,
  operatorName: string,
  supabaseClient: any
) {
  // Generate report
  const generator = createReportGenerator();
  const pdfBlob = await generator.generateReport(
    sessionData,
    operatorName,
    {
      standard: 'ASME',
      includeWaveform: true,
      includeDataTable: true,
      includeDefectDetails: true
    }
  );

  // Upload to Supabase Storage
  const fileName = `reports/report-${sessionData.id}-${Date.now()}.pdf`;
  const { data, error } = await supabaseClient
    .storage
    .from('reports')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) {
    console.error('Upload failed:', error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabaseClient
    .storage
    .from('reports')
    .getPublicUrl(fileName);

  console.log('Report uploaded:', urlData.publicUrl);
  return urlData.publicUrl;
}

/**
 * Example 6: Batch Report Generation
 */
export async function batchReportGenerationExample(
  sessions: CompleteSessionData[],
  operatorName: string
) {
  const generator = createReportGenerator();
  const reports: { sessionId: string; blob: Blob }[] = [];

  for (const session of sessions) {
    try {
      const pdfBlob = await generator.generateReport(
        session,
        operatorName,
        { standard: 'ASME' }
      );

      reports.push({
        sessionId: session.id,
        blob: pdfBlob
      });

      console.log(`Generated report for session ${session.id}`);
    } catch (error) {
      console.error(`Failed to generate report for session ${session.id}:`, error);
    }
  }

  return reports;
}

/**
 * Example 7: Report with Different Standards
 */
export async function multiStandardReportsExample(sessionData: CompleteSessionData) {
  const generator = createReportGenerator();
  const standards: Array<'ASME' | 'ISO' | 'EN' | 'ASTM'> = ['ASME', 'ISO', 'EN', 'ASTM'];

  for (const standard of standards) {
    const pdfBlob = await generator.generateReport(
      sessionData,
      'Test Operator',
      { standard }
    );

    downloadPDF(pdfBlob, `report-${standard}-${sessionData.id}.pdf`);
  }
}

/**
 * Example 8: Error Handling
 */
export async function reportGenerationWithErrorHandling(
  sessionData: CompleteSessionData,
  operatorName: string
) {
  try {
    const generator = createReportGenerator();
    
    // Validate session data
    if (!sessionData.signalData || sessionData.signalData.length === 0) {
      throw new Error('No signal data available for report generation');
    }

    const pdfBlob = await generator.generateReport(
      sessionData,
      operatorName,
      {
        standard: 'ASME',
        includeWaveform: true
      }
    );

    // Success
    console.log('Report generated successfully');
    return pdfBlob;

  } catch (error) {
    console.error('Report generation failed:', error);
    
    // Fallback: Generate minimal report without waveform
    try {
      const generator = createReportGenerator();
      const fallbackBlob = await generator.generateReport(
        sessionData,
        operatorName,
        {
          standard: 'ASME',
          includeWaveform: false,
          includeDataTable: true,
          includeDefectDetails: false
        }
      );
      
      console.log('Fallback report generated');
      return fallbackBlob;
      
    } catch (fallbackError) {
      console.error('Fallback report generation also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Example 9: Generate Report from Store
 */
export async function generateReportFromStore(testingStore: any) {
  const state = testingStore.getState();
  
  if (!state.currentSession) {
    throw new Error('No active session');
  }

  // Build complete session data from store
  const sessionData: CompleteSessionData = {
    ...state.currentSession,
    signalData: state.signalBuffer,
    defects: state.detectedDefects
  };

  const generator = createReportGenerator();
  const pdfBlob = await generator.generateReport(
    sessionData,
    state.operatorName || 'Unknown Operator',
    {
      standard: 'ASME',
      includeWaveform: true,
      includeDataTable: true,
      includeDefectDetails: true
    }
  );

  return pdfBlob;
}

/**
 * Example 10: Preview Report in New Window
 */
export async function previewReportExample(
  sessionData: CompleteSessionData,
  operatorName: string
) {
  const generator = createReportGenerator();
  const pdfBlob = await generator.generateReport(
    sessionData,
    operatorName,
    { standard: 'ASME' }
  );

  // Create blob URL
  const url = URL.createObjectURL(pdfBlob);

  // Open in new window
  const previewWindow = window.open(url, '_blank');
  
  if (!previewWindow) {
    console.warn('Popup blocked. Downloading instead.');
    downloadPDF(pdfBlob, `report-${sessionData.id}.pdf`);
  }

  // Clean up URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Helper: Download PDF
 */
function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Example 11: Generate Report with Real-time Progress
 */
export async function generateReportWithProgress(
  sessionData: CompleteSessionData,
  operatorName: string,
  onProgress: (progress: number, message: string) => void
) {
  try {
    onProgress(0, 'Initializing report generator...');
    const generator = createReportGenerator();

    onProgress(20, 'Generating report header...');
    // Header is generated automatically

    onProgress(40, 'Adding testing parameters...');
    // Parameters are added automatically

    onProgress(60, 'Capturing waveform screenshot...');
    // Waveform capture happens during generation

    onProgress(80, 'Adding defect analysis...');
    // Defect analysis is added automatically

    const pdfBlob = await generator.generateReport(
      sessionData,
      operatorName,
      {
        standard: 'ASME',
        includeWaveform: true,
        includeDataTable: true,
        includeDefectDetails: true
      }
    );

    onProgress(100, 'Report generation complete!');
    return pdfBlob;

  } catch (error) {
    onProgress(-1, `Error: ${error.message}`);
    throw error;
  }
}

/**
 * Example 12: Generate Report Summary (Metadata Only)
 */
export function generateReportSummary(sessionData: CompleteSessionData): string {
  const criticalDefects = sessionData.defects.filter(d => d.severity === 'critical').length;
  const highDefects = sessionData.defects.filter(d => d.severity === 'high').length;
  const totalDefects = sessionData.defects.length;

  let status = 'PASS';
  if (criticalDefects > 0) {
    status = 'FAIL';
  } else if (highDefects > 0) {
    status = 'CONDITIONAL';
  } else if (totalDefects > 0) {
    status = 'PASS WITH NOTES';
  }

  return `
Report Summary
--------------
Project: ${sessionData.projectName}
Status: ${status}
Total Defects: ${totalDefects}
  - Critical: ${criticalDefects}
  - High: ${highDefects}
  - Medium: ${sessionData.defects.filter(d => d.severity === 'medium').length}
  - Low: ${sessionData.defects.filter(d => d.severity === 'low').length}
Duration: ${calculateDuration(sessionData)}
Data Points: ${sessionData.signalData.length}
  `.trim();
}

function calculateDuration(session: CompleteSessionData): string {
  const start = new Date(session.startTime).getTime();
  const end = session.endTime ? new Date(session.endTime).getTime() : Date.now();
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
