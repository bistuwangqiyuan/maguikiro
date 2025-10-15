/**
 * 报告模板系统 / Report Template System
 * 
 * Provides standardized report templates for different international standards.
 * Supports ASME, ISO, EN, and ASTM formats with customizable sections.
 */

import type { InternationalStandard } from '$lib/types';

/**
 * 报告模板部分 / Report Template Section
 */
export interface ReportTemplateSection {
  title: string;
  fields?: string[];
  content?: 'waveform' | 'data-table' | 'defect-table' | 'defect-statistics' | 'custom';
  customContent?: string;
  required?: boolean;
}

/**
 * 报告模板 / Report Template
 */
export interface ReportTemplate {
  id: string;
  name: string;
  standard: InternationalStandard;
  description: string;
  header: {
    title: string;
    subtitle: string;
    standardReference: string;
    includeCompanyLogo?: boolean;
    includeDate?: boolean;
  };
  sections: ReportTemplateSection[];
  footer?: {
    includePageNumbers?: boolean;
    customText?: string;
  };
  signatures: {
    operator: boolean;
    inspector: boolean;
    reviewer?: boolean;
    approver?: boolean;
  };
}

/**
 * 模板变量 / Template Variables
 */
export interface TemplateVariables {
  projectName: string;
  testDate: string;
  operator: string;
  sessionId: string;
  status: string;
  duration: string;
  companyName?: string;
  companyLogo?: string;
  equipmentModel?: string;
  equipmentSerial?: string;
  testLocation?: string;
  customerName?: string;
  partNumber?: string;
  materialType?: string;
  [key: string]: string | undefined;
}

/**
 * ASME 标准报告模板 / ASME Standard Report Template
 */
export const asmeReportTemplate: ReportTemplate = {
  id: 'asme-v-article-7',
  name: 'ASME Section V Article 7',
  standard: 'ASME',
  description: 'Magnetic Particle Testing Report per ASME Section V, Article 7',
  header: {
    title: 'Magnetic Particle Testing Report',
    subtitle: 'Non-Destructive Examination',
    standardReference: 'ASME Section V, Article 7',
    includeCompanyLogo: true,
    includeDate: true
  },
  sections: [
    {
      title: 'Test Information',
      fields: ['projectName', 'testDate', 'operator', 'sessionId', 'status', 'duration'],
      required: true
    },
    {
      title: 'Equipment Information',
      fields: ['equipmentModel', 'equipmentSerial', 'testLocation'],
      required: true
    },
    {
      title: 'Material Information',
      fields: ['partNumber', 'materialType', 'customerName'],
      required: false
    },
    {
      title: 'Testing Parameters',
      content: 'custom',
      required: true
    },
    {
      title: 'Waveform Display',
      content: 'waveform',
      required: true
    },
    {
      title: 'Data Summary',
      content: 'data-table',
      required: true
    },
    {
      title: 'Defect Analysis',
      content: 'defect-statistics',
      required: true
    },
    {
      title: 'Defect Details',
      content: 'defect-table',
      required: false
    },
    {
      title: 'Conclusion',
      content: 'custom',
      required: true
    },
    {
      title: 'Acceptance Criteria',
      customContent: 'Per ASME Section V, Article 7, all relevant indications shall be evaluated.',
      required: true
    }
  ],
  footer: {
    includePageNumbers: true,
    customText: 'This report is valid only with authorized signatures'
  },
  signatures: {
    operator: true,
    inspector: true,
    reviewer: false,
    approver: false
  }
};

/**
 * ISO 标准报告模板 / ISO Standard Report Template
 */
export const isoReportTemplate: ReportTemplate = {
  id: 'iso-9712',
  name: 'ISO 9712',
  standard: 'ISO',
  description: 'Non-destructive Testing Report per ISO 9712',
  header: {
    title: 'Non-Destructive Testing Report',
    subtitle: 'Magnetic Particle Inspection',
    standardReference: 'ISO 9712 - Non-destructive Testing Personnel Qualification',
    includeCompanyLogo: true,
    includeDate: true
  },
  sections: [
    {
      title: 'General Information',
      fields: ['projectName', 'testDate', 'operator', 'sessionId', 'testLocation'],
      required: true
    },
    {
      title: 'Test Object',
      fields: ['partNumber', 'materialType', 'customerName'],
      required: true
    },
    {
      title: 'Test Equipment',
      fields: ['equipmentModel', 'equipmentSerial'],
      required: true
    },
    {
      title: 'Test Procedure',
      content: 'custom',
      customContent: 'Testing performed in accordance with ISO 9712 requirements.',
      required: true
    },
    {
      title: 'Test Parameters',
      content: 'custom',
      required: true
    },
    {
      title: 'Test Results - Waveform',
      content: 'waveform',
      required: true
    },
    {
      title: 'Test Results - Data',
      content: 'data-table',
      required: true
    },
    {
      title: 'Indications Found',
      content: 'defect-statistics',
      required: true
    },
    {
      title: 'Indication Details',
      content: 'defect-table',
      required: true
    },
    {
      title: 'Evaluation',
      content: 'custom',
      required: true
    },
    {
      title: 'Remarks',
      content: 'custom',
      required: false
    }
  ],
  footer: {
    includePageNumbers: true,
    customText: 'Report prepared by certified NDT personnel'
  },
  signatures: {
    operator: true,
    inspector: true,
    reviewer: true,
    approver: false
  }
};

/**
 * EN 标准报告模板 / EN Standard Report Template
 */
export const enReportTemplate: ReportTemplate = {
  id: 'en-10228',
  name: 'EN 10228',
  standard: 'EN',
  description: 'Steel Forgings Testing Report per EN 10228',
  header: {
    title: 'Non-Destructive Testing Report',
    subtitle: 'Magnetic Particle Testing of Steel Forgings',
    standardReference: 'EN 10228 - Non-destructive Testing of Steel Forgings',
    includeCompanyLogo: true,
    includeDate: true
  },
  sections: [
    {
      title: 'Identification',
      fields: ['projectName', 'partNumber', 'materialType', 'customerName'],
      required: true
    },
    {
      title: 'Test Details',
      fields: ['testDate', 'operator', 'testLocation', 'equipmentModel'],
      required: true
    },
    {
      title: 'Test Conditions',
      content: 'custom',
      required: true
    },
    {
      title: 'Testing Parameters',
      content: 'custom',
      required: true
    },
    {
      title: 'Waveform Recording',
      content: 'waveform',
      required: true
    },
    {
      title: 'Measurement Data',
      content: 'data-table',
      required: true
    },
    {
      title: 'Defect Assessment',
      content: 'defect-statistics',
      required: true
    },
    {
      title: 'Defect Register',
      content: 'defect-table',
      required: true
    },
    {
      title: 'Test Result',
      content: 'custom',
      required: true
    },
    {
      title: 'Acceptance Level',
      customContent: 'Acceptance criteria per EN 10228 requirements.',
      required: true
    }
  ],
  footer: {
    includePageNumbers: true,
    customText: 'Certified in accordance with EN standards'
  },
  signatures: {
    operator: true,
    inspector: true,
    reviewer: false,
    approver: true
  }
};

/**
 * ASTM 标准报告模板 / ASTM Standard Report Template
 */
export const astmReportTemplate: ReportTemplate = {
  id: 'astm-e709',
  name: 'ASTM E709',
  standard: 'ASTM',
  description: 'Magnetic Particle Testing Report per ASTM E709',
  header: {
    title: 'Magnetic Particle Testing Report',
    subtitle: 'Standard Guide for Magnetic Particle Testing',
    standardReference: 'ASTM E709 - Standard Guide for Magnetic Particle Testing',
    includeCompanyLogo: true,
    includeDate: true
  },
  sections: [
    {
      title: 'Report Information',
      fields: ['projectName', 'testDate', 'operator', 'sessionId'],
      required: true
    },
    {
      title: 'Part Information',
      fields: ['partNumber', 'materialType', 'customerName', 'testLocation'],
      required: true
    },
    {
      title: 'Equipment',
      fields: ['equipmentModel', 'equipmentSerial'],
      required: true
    },
    {
      title: 'Test Method',
      customContent: 'Testing conducted per ASTM E709 standard practice.',
      required: true
    },
    {
      title: 'Test Parameters',
      content: 'custom',
      required: true
    },
    {
      title: 'Waveform Data',
      content: 'waveform',
      required: true
    },
    {
      title: 'Statistical Summary',
      content: 'data-table',
      required: true
    },
    {
      title: 'Discontinuities',
      content: 'defect-statistics',
      required: true
    },
    {
      title: 'Discontinuity Details',
      content: 'defect-table',
      required: false
    },
    {
      title: 'Interpretation',
      content: 'custom',
      required: true
    },
    {
      title: 'Disposition',
      content: 'custom',
      required: true
    }
  ],
  footer: {
    includePageNumbers: true,
    customText: 'Report conforms to ASTM E709 requirements'
  },
  signatures: {
    operator: true,
    inspector: true,
    reviewer: false,
    approver: false
  }
};

/**
 * 自定义报告模板 / Custom Report Template
 */
export const customReportTemplate: ReportTemplate = {
  id: 'custom',
  name: 'Custom Template',
  standard: 'custom',
  description: 'Customizable report template',
  header: {
    title: 'Magnetic Testing Report',
    subtitle: 'Custom Format',
    standardReference: 'Custom Testing Standard',
    includeCompanyLogo: true,
    includeDate: true
  },
  sections: [
    {
      title: 'Test Information',
      fields: ['projectName', 'testDate', 'operator', 'sessionId'],
      required: true
    },
    {
      title: 'Testing Parameters',
      content: 'custom',
      required: true
    },
    {
      title: 'Waveform Display',
      content: 'waveform',
      required: true
    },
    {
      title: 'Data Summary',
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
    includePageNumbers: true
  },
  signatures: {
    operator: true,
    inspector: true
  }
};

/**
 * 所有可用模板 / All Available Templates
 */
export const reportTemplates: Record<InternationalStandard, ReportTemplate> = {
  'ASME': asmeReportTemplate,
  'ISO': isoReportTemplate,
  'EN': enReportTemplate,
  'ASTM': astmReportTemplate,
  'custom': customReportTemplate
};

/**
 * 获取报告模板 / Get Report Template
 */
export function getReportTemplate(standard: InternationalStandard): ReportTemplate {
  return reportTemplates[standard] || asmeReportTemplate;
}

/**
 * 获取所有模板列表 / Get All Templates List
 */
export function getAllTemplates(): ReportTemplate[] {
  return Object.values(reportTemplates);
}

/**
 * 替换模板变量 / Replace Template Variables
 */
export function replaceTemplateVariables(
  text: string,
  variables: TemplateVariables
): string {
  let result = text;
  
  // Replace {{variableName}} with actual values
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  return result;
}

/**
 * 验证模板变量 / Validate Template Variables
 */
export function validateTemplateVariables(
  template: ReportTemplate,
  variables: TemplateVariables
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  // Check required sections
  template.sections
    .filter(section => section.required && section.fields)
    .forEach(section => {
      section.fields?.forEach(field => {
        if (!variables[field]) {
          missingFields.push(field);
        }
      });
    });
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * 格式化字段名称 / Format Field Name
 */
export function formatFieldName(fieldName: string): string {
  // Convert camelCase to Title Case with spaces
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * 获取字段显示值 / Get Field Display Value
 */
export function getFieldDisplayValue(
  fieldName: string,
  variables: TemplateVariables
): string {
  const value = variables[fieldName];
  
  if (!value) {
    return 'N/A';
  }
  
  // Special formatting for certain fields
  switch (fieldName) {
    case 'testDate':
      return new Date(value).toLocaleString();
    case 'status':
      return value.toUpperCase();
    default:
      return value;
  }
}
