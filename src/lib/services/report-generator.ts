/**
 * 报告生成服务 / Report Generator Service
 * 
 * Generates PDF reports from testing session data using jsPDF and html2canvas.
 * Supports multiple international standards (ASME, ISO, EN, ASTM).
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { 
  CompleteSessionData, 
  InternationalStandard,
  Defect,
  TestingParameters
} from '$lib/types';
import { 
  getReportTemplate, 
  replaceTemplateVariables,
  validateTemplateVariables,
  formatFieldName,
  getFieldDisplayValue,
  type ReportTemplate,
  type TemplateVariables
} from './report-templates';

/**
 * 报告生成配置 / Report Generation Config
 */
export interface ReportGenerationConfig {
  standard?: InternationalStandard;
  template?: ReportTemplate;
  includeWaveform?: boolean;
  includeDataTable?: boolean;
  includeDefectDetails?: boolean;
  companyLogo?: string;
  companyName?: string;
  operatorSignature?: string;
  equipmentModel?: string;
  equipmentSerial?: string;
  testLocation?: string;
  customerName?: string;
  partNumber?: string;
  materialType?: string;
}

/**
 * 报告生成器类 / Report Generator Class
 */
export class ReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private pageWidth: number = 210; // A4 width in mm
  private margin: number = 15;
  private lineHeight: number = 7;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  /**
   * 生成完整报告 / Generate Complete Report
   */
  async generateReport(
    session: CompleteSessionData,
    operatorName: string,
    config: ReportGenerationConfig = {}
  ): Promise<Blob> {
    // Reset document
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = 20;

    // Get template
    const template = config.template || getReportTemplate(config.standard || 'ASME');

    // Prepare template variables
    const variables = this.prepareTemplateVariables(session, operatorName, config);

    // Validate template variables
    const validation = validateTemplateVariables(template, variables);
    if (!validation.valid) {
      console.warn('Missing template variables:', validation.missingFields);
    }

    // 1. Add report header using template
    this.addTemplateHeader(template, variables, config);

    // 2. Process template sections
    for (const section of template.sections) {
      await this.addTemplateSection(section, session, variables, config);
    }

    // 3. Add signatures section using template
    this.addTemplateSignatures(template, operatorName, config);

    // 4. Add footer if specified
    if (template.footer?.includePageNumbers) {
      this.addPageNumbers();
    }

    return this.doc.output('blob');
  }

  /**
   * 添加报告头部 / Add Report Header
   */
  private addHeader(session: CompleteSessionData, config: ReportGenerationConfig): void {
    const { standard = 'ASME', companyName = 'DOPPLER' } = config;

    // Company name and logo area
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyName, this.margin, this.currentY);

    // Report title
    this.currentY += 10;
    this.doc.setFontSize(16);
    this.doc.text('Magnetic Testing Report', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Standard reference
    this.currentY += 8;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const standardText = this.getStandardText(standard);
    this.doc.text(standardText, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Horizontal line
    this.currentY += 5;
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  /**
   * 添加项目信息 / Add Project Information
   */
  private addProjectInfo(
    session: CompleteSessionData,
    operatorName: string,
    config: ReportGenerationConfig
  ): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Test Information', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const info = [
      ['Project Name:', session.projectName],
      ['Test Date:', new Date(session.startTime).toLocaleString()],
      ['Operator:', operatorName],
      ['Session ID:', session.id],
      ['Status:', session.status.toUpperCase()],
      ['Duration:', this.calculateDuration(session)]
    ];

    info.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 40, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 5;
  }

  /**
   * 添加参数表格 / Add Parameters Table
   */
  private addParametersTable(parameters: TestingParameters): void {
    this.checkPageBreak(60);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Testing Parameters', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    // Table header
    const tableStartY = this.currentY;
    const colWidth = (this.pageWidth - 2 * this.margin) / 2;

    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, tableStartY, colWidth, 8, 'F');
    this.doc.rect(this.margin + colWidth, tableStartY, colWidth, 8, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Parameter', this.margin + 2, tableStartY + 5);
    this.doc.text('Value', this.margin + colWidth + 2, tableStartY + 5);

    this.currentY = tableStartY + 8;

    // Table rows
    const params = [
      ['Gain', `${parameters.gain} dB`],
      ['Filter', parameters.filter],
      ['Velocity', `${parameters.velocity} mm/s`],
      ['Threshold', `${parameters.threshold}`],
      ['Gate A - Start', `${parameters.gateA.start} mm`],
      ['Gate A - Width', `${parameters.gateA.width} mm`],
      ['Gate A - Threshold', `${parameters.gateA.alarmThreshold}`],
      ['Gate B - Start', `${parameters.gateB.start} mm`],
      ['Gate B - Width', `${parameters.gateB.width} mm`],
      ['Gate B - Threshold', `${parameters.gateB.alarmThreshold}`]
    ];

    this.doc.setFont('helvetica', 'normal');
    params.forEach(([param, value]) => {
      this.doc.rect(this.margin, this.currentY, colWidth, 7);
      this.doc.rect(this.margin + colWidth, this.currentY, colWidth, 7);
      this.doc.text(param, this.margin + 2, this.currentY + 5);
      this.doc.text(value, this.margin + colWidth + 2, this.currentY + 5);
      this.currentY += 7;
    });

    this.currentY += 5;
  }

  /**
   * 添加波形截图 / Add Waveform Screenshot
   */
  private async addWaveformScreenshot(): Promise<void> {
    try {
      const waveformElement = document.getElementById('waveform-chart');
      if (!waveformElement) {
        console.warn('Waveform chart element not found, skipping screenshot');
        return;
      }

      this.checkPageBreak(100);

      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Waveform Display', this.margin, this.currentY);
      this.currentY += this.lineHeight;

      // Capture waveform as image
      const canvas = await html2canvas(waveformElement, {
        backgroundColor: '#1a1a1a',
        scale: 2
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pageWidth - 2 * this.margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if image fits on current page
      if (this.currentY + imgHeight > this.pageHeight - this.margin) {
        this.addPage();
      }

      this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 10;
    } catch (error) {
      console.error('Failed to capture waveform screenshot:', error);
    }
  }

  /**
   * 添加数据表格摘要 / Add Data Table Summary
   */
  private addDataTableSummary(session: CompleteSessionData): void {
    this.checkPageBreak(60);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Data Summary', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const signalData = session.signalData;
    const summary = [
      ['Total Data Points:', signalData.length.toString()],
      ['Average Amplitude:', this.calculateAverage(signalData.map(d => d.amplitude)).toFixed(3)],
      ['Max Amplitude:', Math.max(...signalData.map(d => d.amplitude)).toFixed(3)],
      ['Min Amplitude:', Math.min(...signalData.map(d => d.amplitude)).toFixed(3)],
      ['Position Range:', `${Math.min(...signalData.map(d => d.position)).toFixed(1)} - ${Math.max(...signalData.map(d => d.position)).toFixed(1)} mm`]
    ];

    summary.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 50, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 5;
  }

  /**
   * 添加缺陷统计 / Add Defect Statistics
   */
  private addDefectStatistics(defects: Defect[], config: ReportGenerationConfig): void {
    this.checkPageBreak(80);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Defect Analysis', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    // Statistics
    const criticalCount = defects.filter(d => d.severity === 'critical').length;
    const highCount = defects.filter(d => d.severity === 'high').length;
    const mediumCount = defects.filter(d => d.severity === 'medium').length;
    const lowCount = defects.filter(d => d.severity === 'low').length;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const stats = [
      ['Total Defects:', defects.length.toString()],
      ['Critical:', criticalCount.toString()],
      ['High:', highCount.toString()],
      ['Medium:', mediumCount.toString()],
      ['Low:', lowCount.toString()]
    ];

    stats.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 40, this.currentY);
      this.currentY += this.lineHeight;
    });

    // Defect details table (if enabled and defects exist)
    if (config.includeDefectDetails !== false && defects.length > 0) {
      this.currentY += 5;
      this.addDefectDetailsTable(defects);
    }

    this.currentY += 5;
  }

  /**
   * 添加缺陷详情表格 / Add Defect Details Table
   */
  private addDefectDetailsTable(defects: Defect[]): void {
    this.checkPageBreak(60);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Defect Details', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    // Table header
    const colWidths = [15, 30, 30, 30, 65];
    const headers = ['No.', 'Position (mm)', 'Amplitude', 'Severity', 'Gate'];

    this.doc.setFillColor(240, 240, 240);
    let xPos = this.margin;
    colWidths.forEach((width, i) => {
      this.doc.rect(xPos, this.currentY, width, 8, 'F');
      this.doc.setFontSize(9);
      this.doc.text(headers[i], xPos + 2, this.currentY + 5);
      xPos += width;
    });

    this.currentY += 8;

    // Table rows (limit to first 20 defects to avoid excessive pages)
    const displayDefects = defects.slice(0, 20);
    this.doc.setFont('helvetica', 'normal');

    displayDefects.forEach((defect, index) => {
      this.checkPageBreak(10);

      xPos = this.margin;
      const rowData = [
        (index + 1).toString(),
        defect.position.toFixed(2),
        defect.amplitude.toFixed(3),
        defect.severity.toUpperCase(),
        defect.gateTriggered || 'N/A'
      ];

      colWidths.forEach((width, i) => {
        this.doc.rect(xPos, this.currentY, width, 7);
        this.doc.text(rowData[i], xPos + 2, this.currentY + 5);
        xPos += width;
      });

      this.currentY += 7;
    });

    if (defects.length > 20) {
      this.currentY += 3;
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`... and ${defects.length - 20} more defects`, this.margin, this.currentY);
      this.currentY += 5;
    }
  }

  /**
   * 添加结论 / Add Conclusion
   */
  private addConclusion(session: CompleteSessionData, config: ReportGenerationConfig): void {
    this.checkPageBreak(40);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Conclusion', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const criticalDefects = session.defects.filter(d => d.severity === 'critical').length;
    const highDefects = session.defects.filter(d => d.severity === 'high').length;

    let conclusion = '';
    let recommendation = '';

    if (criticalDefects > 0) {
      conclusion = `REJECT: ${criticalDefects} critical defect(s) detected. The tested component does not meet acceptance criteria.`;
      recommendation = 'Immediate repair or replacement required. Re-test after corrective action.';
    } else if (highDefects > 0) {
      conclusion = `CONDITIONAL: ${highDefects} high-severity defect(s) detected. Further evaluation recommended.`;
      recommendation = 'Engineering review required to determine acceptability.';
    } else if (session.defects.length > 0) {
      conclusion = `ACCEPT WITH NOTES: ${session.defects.length} minor defect(s) detected within acceptable limits.`;
      recommendation = 'Monitor during next inspection cycle.';
    } else {
      conclusion = 'ACCEPT: No defects detected. Component meets all acceptance criteria.';
      recommendation = 'Continue with normal inspection schedule.';
    }

    // Wrap text
    const conclusionLines = this.doc.splitTextToSize(conclusion, this.pageWidth - 2 * this.margin);
    conclusionLines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 3;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recommendation:', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.doc.setFont('helvetica', 'normal');
    const recommendationLines = this.doc.splitTextToSize(recommendation, this.pageWidth - 2 * this.margin);
    recommendationLines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 5;
  }

  /**
   * 添加签名区域 / Add Signatures Section
   */
  private addSignatures(operatorName: string, config: ReportGenerationConfig): void {
    this.checkPageBreak(40);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Signatures', this.margin, this.currentY);
    this.currentY += this.lineHeight + 5;

    const colWidth = (this.pageWidth - 2 * this.margin - 10) / 2;

    // Operator signature
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Operator:', this.margin, this.currentY);
    this.currentY += this.lineHeight;
    this.doc.text(operatorName, this.margin, this.currentY);
    this.currentY += this.lineHeight + 5;
    this.doc.line(this.margin, this.currentY, this.margin + colWidth, this.currentY);
    this.doc.setFontSize(8);
    this.doc.text('Signature', this.margin, this.currentY + 4);

    // Inspector signature (right side)
    const rightX = this.margin + colWidth + 10;
    this.currentY -= this.lineHeight * 2 + 5;
    this.doc.setFontSize(10);
    this.doc.text('Inspector:', rightX, this.currentY);
    this.currentY += this.lineHeight * 2 + 5;
    this.doc.line(rightX, this.currentY, rightX + colWidth, this.currentY);
    this.doc.setFontSize(8);
    this.doc.text('Signature', rightX, this.currentY + 4);

    // Date
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.text(`Date: ${new Date().toLocaleDateString()}`, this.margin, this.currentY);
  }

  /**
   * 检查是否需要分页 / Check Page Break
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addPage();
    }
  }

  /**
   * 添加新页 / Add New Page
   */
  private addPage(): void {
    this.doc.addPage();
    this.currentY = 20;
  }

  /**
   * 获取标准文本 / Get Standard Text
   */
  private getStandardText(standard: InternationalStandard): string {
    const standards: Record<InternationalStandard, string> = {
      'ASME': 'ASME Section V, Article 7 - Magnetic Particle Testing',
      'ISO': 'ISO 9712 - Non-destructive Testing',
      'EN': 'EN 10228 - Non-destructive Testing of Steel Forgings',
      'ASTM': 'ASTM E709 - Standard Guide for Magnetic Particle Testing',
      'custom': 'Custom Testing Standard'
    };
    return standards[standard] || standards['ASME'];
  }

  /**
   * 计算持续时间 / Calculate Duration
   */
  private calculateDuration(session: CompleteSessionData): string {
    const start = new Date(session.startTime).getTime();
    const end = session.endTime ? new Date(session.endTime).getTime() : Date.now();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  /**
   * 计算平均值 / Calculate Average
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * 准备模板变量 / Prepare Template Variables
   */
  private prepareTemplateVariables(
    session: CompleteSessionData,
    operatorName: string,
    config: ReportGenerationConfig
  ): TemplateVariables {
    return {
      projectName: session.projectName,
      testDate: new Date(session.startTime).toLocaleString(),
      operator: operatorName,
      sessionId: session.id,
      status: session.status.toUpperCase(),
      duration: this.calculateDuration(session),
      companyName: config.companyName || 'DOPPLER',
      companyLogo: config.companyLogo || '',
      equipmentModel: config.equipmentModel || 'DOPPLER MT-2000',
      equipmentSerial: config.equipmentSerial || 'N/A',
      testLocation: config.testLocation || 'N/A',
      customerName: config.customerName || 'N/A',
      partNumber: config.partNumber || 'N/A',
      materialType: config.materialType || 'N/A'
    };
  }

  /**
   * 添加模板头部 / Add Template Header
   */
  private addTemplateHeader(
    template: ReportTemplate,
    variables: TemplateVariables,
    config: ReportGenerationConfig
  ): void {
    const { header } = template;

    // Company logo (if provided and enabled)
    if (header.includeCompanyLogo && config.companyLogo) {
      try {
        this.doc.addImage(config.companyLogo, 'PNG', this.margin, this.currentY, 30, 10);
      } catch (error) {
        console.warn('Failed to add company logo:', error);
      }
    }

    // Company name
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    const companyName = variables.companyName || 'DOPPLER';
    this.doc.text(companyName, this.pageWidth - this.margin, this.currentY, { align: 'right' });

    // Report title
    this.currentY += 12;
    this.doc.setFontSize(16);
    const title = replaceTemplateVariables(header.title, variables);
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Subtitle
    if (header.subtitle) {
      this.currentY += 7;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      const subtitle = replaceTemplateVariables(header.subtitle, variables);
      this.doc.text(subtitle, this.pageWidth / 2, this.currentY, { align: 'center' });
    }

    // Standard reference
    this.currentY += 7;
    this.doc.setFontSize(10);
    const standardRef = replaceTemplateVariables(header.standardReference, variables);
    this.doc.text(standardRef, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Date (if enabled)
    if (header.includeDate) {
      this.currentY += 5;
      this.doc.setFontSize(9);
      this.doc.text(`Report Date: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    }

    // Horizontal line
    this.currentY += 5;
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  /**
   * 添加模板部分 / Add Template Section
   */
  private async addTemplateSection(
    section: ReportTemplate['sections'][0],
    session: CompleteSessionData,
    variables: TemplateVariables,
    config: ReportGenerationConfig
  ): Promise<void> {
    this.checkPageBreak(30);

    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(section.title, this.margin, this.currentY);
    this.currentY += this.lineHeight;

    // Section content based on type
    if (section.fields) {
      this.addFieldsSection(section.fields, variables);
    } else if (section.content === 'custom' && !section.customContent) {
      // Custom content sections (parameters, conclusion, etc.)
      if (section.title.toLowerCase().includes('parameter')) {
        this.addParametersTable(session.parameters);
      } else if (section.title.toLowerCase().includes('conclusion')) {
        this.addConclusion(session, config);
      } else {
        this.currentY += 5;
      }
    } else if (section.customContent) {
      // Static custom content
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const content = replaceTemplateVariables(section.customContent, variables);
      const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      });
      this.currentY += 3;
    } else if (section.content === 'waveform') {
      if (config.includeWaveform !== false) {
        await this.addWaveformScreenshot();
      }
    } else if (section.content === 'data-table') {
      if (config.includeDataTable !== false) {
        this.addDataTableSummary(session);
      }
    } else if (section.content === 'defect-statistics') {
      this.addDefectStatistics(session.defects, config);
    } else if (section.content === 'defect-table') {
      if (config.includeDefectDetails !== false && session.defects.length > 0) {
        this.addDefectDetailsTable(session.defects);
      }
    }
  }

  /**
   * 添加字段部分 / Add Fields Section
   */
  private addFieldsSection(fields: string[], variables: TemplateVariables): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    fields.forEach(field => {
      const label = formatFieldName(field);
      const value = getFieldDisplayValue(field, variables);

      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label}:`, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 50, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 5;
  }

  /**
   * 添加模板签名 / Add Template Signatures
   */
  private addTemplateSignatures(
    template: ReportTemplate,
    operatorName: string,
    config: ReportGenerationConfig
  ): void {
    this.checkPageBreak(50);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Signatures', this.margin, this.currentY);
    this.currentY += this.lineHeight + 5;

    const signatures = template.signatures;
    const signatureCount = Object.values(signatures).filter(Boolean).length;
    const colWidth = (this.pageWidth - 2 * this.margin - (signatureCount - 1) * 10) / signatureCount;

    let xPos = this.margin;
    const startY = this.currentY;

    // Operator signature
    if (signatures.operator) {
      this.addSignatureBlock('Operator', operatorName, xPos, startY, colWidth);
      xPos += colWidth + 10;
    }

    // Inspector signature
    if (signatures.inspector) {
      this.addSignatureBlock('Inspector', '', xPos, startY, colWidth);
      xPos += colWidth + 10;
    }

    // Reviewer signature
    if (signatures.reviewer) {
      this.addSignatureBlock('Reviewer', '', xPos, startY, colWidth);
      xPos += colWidth + 10;
    }

    // Approver signature
    if (signatures.approver) {
      this.addSignatureBlock('Approver', '', xPos, startY, colWidth);
    }

    this.currentY = startY + 25;

    // Date
    this.doc.setFontSize(10);
    this.doc.text(`Date: ${new Date().toLocaleDateString()}`, this.margin, this.currentY);
    this.currentY += 10;
  }

  /**
   * 添加签名块 / Add Signature Block
   */
  private addSignatureBlock(
    role: string,
    name: string,
    x: number,
    y: number,
    width: number
  ): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${role}:`, x, y);
    
    if (name) {
      this.doc.text(name, x, y + this.lineHeight);
    }
    
    this.doc.line(x, y + this.lineHeight * 2 + 5, x + width, y + this.lineHeight * 2 + 5);
    this.doc.setFontSize(8);
    this.doc.text('Signature', x, y + this.lineHeight * 2 + 9);
  }

  /**
   * 添加页码 / Add Page Numbers
   */
  private addPageNumbers(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }
}

/**
 * 创建报告生成器实例 / Create Report Generator Instance
 */
export function createReportGenerator(): ReportGenerator {
  return new ReportGenerator();
}
