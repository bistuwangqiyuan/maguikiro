/**
 * 报告模板系统使用示例 / Report Template System Usage Examples
 * 
 * This file demonstrates how to use the report template system
 * with different international standards.
 */

import { 
  getReportTemplate, 
  getAllTemplates,
  replaceTemplateVariables,
  validateTemplateVariables,
  formatFieldName,
  getFieldDisplayValue,
  type TemplateVariables,
  type ReportTemplate
} from '../report-templates';
import { ReportGenerator } from '../report-generator';
import type { CompleteSessionData } from '$lib/types';

/**
 * 示例 1: 获取和使用标准模板 / Example 1: Get and Use Standard Templates
 */
export function example1_getStandardTemplates() {
  console.log('=== Example 1: Get Standard Templates ===\n');

  // 获取 ASME 模板
  const asmeTemplate = getReportTemplate('ASME');
  console.log('ASME Template:', asmeTemplate.name);
  console.log('Description:', asmeTemplate.description);
  console.log('Sections:', asmeTemplate.sections.length);
  console.log('');

  // 获取 ISO 模板
  const isoTemplate = getReportTemplate('ISO');
  console.log('ISO Template:', isoTemplate.name);
  console.log('Description:', isoTemplate.description);
  console.log('');

  // 获取所有模板
  const allTemplates = getAllTemplates();
  console.log('Available Templates:');
  allTemplates.forEach(template => {
    console.log(`  - ${template.name} (${template.standard})`);
  });
  console.log('');
}

/**
 * 示例 2: 模板变量替换 / Example 2: Template Variable Replacement
 */
export function example2_variableReplacement() {
  console.log('=== Example 2: Variable Replacement ===\n');

  const text = `
    Project: {{projectName}}
    Date: {{testDate}}
    Operator: {{operator}}
    Location: {{testLocation}}
    Customer: {{customerName}}
  `;

  const variables: TemplateVariables = {
    projectName: 'Pipeline Inspection Project',
    testDate: '2025-01-10 14:30:00',
    operator: 'John Doe',
    sessionId: 'session-123',
    status: 'completed',
    duration: '15m 30s',
    testLocation: 'Factory A, Building 3',
    customerName: 'ABC Corporation'
  };

  const result = replaceTemplateVariables(text, variables);
  console.log('Original text:', text);
  console.log('\nReplaced text:', result);
  console.log('');
}

/**
 * 示例 3: 验证模板变量 / Example 3: Validate Template Variables
 */
export function example3_validateVariables() {
  console.log('=== Example 3: Validate Template Variables ===\n');

  const template = getReportTemplate('ASME');

  // 完整的变量
  const completeVariables: TemplateVariables = {
    projectName: 'Test Project',
    testDate: '2025-01-10',
    operator: 'John Doe',
    sessionId: 'session-123',
    status: 'completed',
    duration: '10m',
    equipmentModel: 'MT-2000',
    equipmentSerial: 'SN-12345',
    testLocation: 'Factory A'
  };

  const validation1 = validateTemplateVariables(template, completeVariables);
  console.log('Complete variables validation:', validation1);
  console.log('');

  // 不完整的变量
  const incompleteVariables: TemplateVariables = {
    projectName: 'Test Project',
    testDate: '2025-01-10',
    operator: 'John Doe',
    sessionId: 'session-123',
    status: 'completed',
    duration: '10m'
    // Missing: equipmentModel, equipmentSerial, testLocation
  };

  const validation2 = validateTemplateVariables(template, incompleteVariables);
  console.log('Incomplete variables validation:', validation2);
  console.log('Missing fields:', validation2.missingFields);
  console.log('');
}

/**
 * 示例 4: 格式化字段名称 / Example 4: Format Field Names
 */
export function example4_formatFieldNames() {
  console.log('=== Example 4: Format Field Names ===\n');

  const fields = [
    'projectName',
    'testDate',
    'equipmentModel',
    'equipmentSerial',
    'testLocation',
    'customerName',
    'partNumber',
    'materialType'
  ];

  console.log('Field name formatting:');
  fields.forEach(field => {
    const formatted = formatFieldName(field);
    console.log(`  ${field} → ${formatted}`);
  });
  console.log('');
}

/**
 * 示例 5: 获取字段显示值 / Example 5: Get Field Display Values
 */
export function example5_getFieldDisplayValues() {
  console.log('=== Example 5: Get Field Display Values ===\n');

  const variables: TemplateVariables = {
    projectName: 'Pipeline Inspection',
    testDate: '2025-01-10T14:30:00',
    operator: 'John Doe',
    sessionId: 'session-123',
    status: 'completed',
    duration: '15m 30s',
    equipmentModel: 'MT-2000'
  };

  console.log('Field display values:');
  Object.keys(variables).forEach(field => {
    const displayValue = getFieldDisplayValue(field, variables);
    console.log(`  ${field}: ${displayValue}`);
  });
  console.log('');
}

/**
 * 示例 6: 生成 ASME 标准报告 / Example 6: Generate ASME Report
 */
export async function example6_generateASMEReport(
  sessionData: CompleteSessionData,
  operatorName: string
) {
  console.log('=== Example 6: Generate ASME Report ===\n');

  const generator = new ReportGenerator();
  const template = getReportTemplate('ASME');

  const config = {
    template: template,
    companyName: 'DOPPLER Industries',
    companyLogo: 'data:image/png;base64,...', // Base64 encoded logo
    equipmentModel: 'MT-2000',
    equipmentSerial: 'SN-12345',
    testLocation: 'Factory A, Building 3',
    customerName: 'ABC Corporation',
    partNumber: 'P-12345-REV-A',
    materialType: 'ASTM A516 Grade 70',
    includeWaveform: true,
    includeDataTable: true,
    includeDefectDetails: true
  };

  console.log('Generating ASME report...');
  console.log('Template:', template.name);
  console.log('Company:', config.companyName);
  console.log('Equipment:', config.equipmentModel);
  console.log('');

  const pdfBlob = await generator.generateReport(
    sessionData,
    operatorName,
    config
  );

  console.log('Report generated successfully!');
  console.log('PDF size:', pdfBlob.size, 'bytes');
  console.log('');

  return pdfBlob;
}

/**
 * 示例 7: 生成 ISO 标准报告 / Example 7: Generate ISO Report
 */
export async function example7_generateISOReport(
  sessionData: CompleteSessionData,
  operatorName: string
) {
  console.log('=== Example 7: Generate ISO Report ===\n');

  const generator = new ReportGenerator();
  const template = getReportTemplate('ISO');

  const config = {
    template: template,
    companyName: 'International Testing Ltd.',
    equipmentModel: 'MT-2000',
    equipmentSerial: 'SN-67890',
    testLocation: 'Laboratory B',
    customerName: 'XYZ Manufacturing',
    partNumber: 'ISO-P-9876',
    materialType: 'Stainless Steel 316L',
    includeWaveform: true,
    includeDataTable: true,
    includeDefectDetails: true
  };

  console.log('Generating ISO report...');
  console.log('Template:', template.name);
  console.log('Standard:', template.header.standardReference);
  console.log('');

  const pdfBlob = await generator.generateReport(
    sessionData,
    operatorName,
    config
  );

  console.log('Report generated successfully!');
  console.log('PDF size:', pdfBlob.size, 'bytes');
  console.log('');

  return pdfBlob;
}

/**
 * 示例 8: 比较不同模板 / Example 8: Compare Different Templates
 */
export function example8_compareTemplates() {
  console.log('=== Example 8: Compare Templates ===\n');

  const templates = getAllTemplates();

  console.log('Template Comparison:\n');

  templates.forEach(template => {
    console.log(`${template.name} (${template.standard})`);
    console.log(`  Description: ${template.description}`);
    console.log(`  Sections: ${template.sections.length}`);
    console.log(`  Signatures:`);
    console.log(`    - Operator: ${template.signatures.operator}`);
    console.log(`    - Inspector: ${template.signatures.inspector}`);
    console.log(`    - Reviewer: ${template.signatures.reviewer || false}`);
    console.log(`    - Approver: ${template.signatures.approver || false}`);
    console.log(`  Page Numbers: ${template.footer?.includePageNumbers || false}`);
    console.log('');
  });
}

/**
 * 示例 9: 自定义模板 / Example 9: Custom Template
 */
export function example9_customTemplate(): ReportTemplate {
  console.log('=== Example 9: Custom Template ===\n');

  const customTemplate: ReportTemplate = {
    id: 'my-custom-template',
    name: 'My Custom Template',
    standard: 'custom',
    description: 'Custom report template for special requirements',
    
    header: {
      title: 'Special Testing Report',
      subtitle: 'Custom Format for Internal Use',
      standardReference: 'Internal Standard XYZ-123',
      includeCompanyLogo: true,
      includeDate: true
    },
    
    sections: [
      {
        title: 'Project Information',
        fields: ['projectName', 'testDate', 'operator', 'testLocation'],
        required: true
      },
      {
        title: 'Equipment Details',
        fields: ['equipmentModel', 'equipmentSerial'],
        required: true
      },
      {
        title: 'Special Instructions',
        customContent: 'This test was performed according to internal procedures for {{customerName}}.',
        required: false
      },
      {
        title: 'Test Parameters',
        content: 'custom',
        required: true
      },
      {
        title: 'Waveform Display',
        content: 'waveform',
        required: true
      },
      {
        title: 'Results Summary',
        content: 'data-table',
        required: true
      },
      {
        title: 'Defect Analysis',
        content: 'defect-statistics',
        required: true
      },
      {
        title: 'Conclusion',
        content: 'custom',
        required: true
      }
    ],
    
    footer: {
      includePageNumbers: true,
      customText: 'Internal Use Only - Confidential'
    },
    
    signatures: {
      operator: true,
      inspector: true,
      reviewer: true,
      approver: false
    }
  };

  console.log('Custom template created:');
  console.log('  Name:', customTemplate.name);
  console.log('  Sections:', customTemplate.sections.length);
  console.log('  Footer text:', customTemplate.footer?.customText);
  console.log('');

  return customTemplate;
}

/**
 * 示例 10: 使用自定义模板生成报告 / Example 10: Generate Report with Custom Template
 */
export async function example10_generateCustomReport(
  sessionData: CompleteSessionData,
  operatorName: string
) {
  console.log('=== Example 10: Generate Custom Report ===\n');

  const generator = new ReportGenerator();
  const customTemplate = example9_customTemplate();

  const config = {
    template: customTemplate,
    companyName: 'My Company',
    equipmentModel: 'Custom-MT-3000',
    equipmentSerial: 'CUSTOM-001',
    testLocation: 'Special Lab',
    customerName: 'VIP Customer',
    partNumber: 'CUSTOM-P-001',
    materialType: 'Special Alloy',
    includeWaveform: true,
    includeDataTable: true,
    includeDefectDetails: true
  };

  console.log('Generating custom report...');
  console.log('Template:', customTemplate.name);
  console.log('');

  const pdfBlob = await generator.generateReport(
    sessionData,
    operatorName,
    config
  );

  console.log('Custom report generated successfully!');
  console.log('PDF size:', pdfBlob.size, 'bytes');
  console.log('');

  return pdfBlob;
}

/**
 * 运行所有示例 / Run All Examples
 */
export function runAllExamples() {
  console.log('========================================');
  console.log('Report Template System Examples');
  console.log('========================================\n');

  example1_getStandardTemplates();
  example2_variableReplacement();
  example3_validateVariables();
  example4_formatFieldNames();
  example5_getFieldDisplayValues();
  example8_compareTemplates();
  example9_customTemplate();

  console.log('========================================');
  console.log('Examples completed!');
  console.log('========================================');
}

// 导出所有示例函数
export const examples = {
  example1_getStandardTemplates,
  example2_variableReplacement,
  example3_validateVariables,
  example4_formatFieldNames,
  example5_getFieldDisplayValues,
  example6_generateASMEReport,
  example7_generateISOReport,
  example8_compareTemplates,
  example9_customTemplate,
  example10_generateCustomReport,
  runAllExamples
};
