/**
 * 国际标准预设参数配置 / International Standard Preset Parameters
 * 
 * 包含符合国际无损检测标准的预设参数配置
 * Includes preset parameter configurations compliant with international NDT standards
 */

import type { TestingParameters } from '$lib/types/signal';
import { FILTER_TYPES, COLORS } from './constants';

/**
 * 标准预设接口 / Standard Preset Interface
 */
export interface StandardPreset {
	id: string;
	name: string;
	nameEn: string;
	description: string;
	descriptionEn: string;
	standard: string;
	referenceUrl?: string;
	parameters: TestingParameters;
}

/**
 * 国际标准预设参数 / International Standard Presets
 */
export const STANDARD_PRESETS: Record<string, StandardPreset> = {
	'ASME-V-Article-7': {
		id: 'ASME-V-Article-7',
		name: 'ASME V 第7章',
		nameEn: 'ASME Section V, Article 7',
		description: '美国机械工程师协会无损检测标准 - 磁粉检测',
		descriptionEn: 'ASME Boiler and Pressure Vessel Code - Magnetic Particle Testing',
		standard: 'ASME-V-Article-7',
		referenceUrl: 'https://www.asme.org/codes-standards/find-codes-standards/bpvc-v-nde',
		parameters: {
			gain: 60,
			filter: FILTER_TYPES.BANDPASS,
			velocity: 1.0,
			gateA: {
				enabled: true,
				start: 0,
				width: 100,
				height: 5.0,
				alarmThreshold: 1.5,
				color: COLORS.WAVEFORM_GATE_A
			},
			gateB: {
				enabled: true,
				start: 100,
				width: 100,
				height: 5.0,
				alarmThreshold: 2.0,
				color: COLORS.WAVEFORM_GATE_B
			},
			threshold: 1.2
		}
	},

	'ISO-9712-Level-2': {
		id: 'ISO-9712-Level-2',
		name: 'ISO 9712 二级',
		nameEn: 'ISO 9712 Level 2',
		description: 'ISO无损检测人员资格认证标准 - 二级操作员',
		descriptionEn: 'ISO Qualification and Certification of NDT Personnel - Level 2',
		standard: 'ISO-9712-Level-2',
		referenceUrl: 'https://www.iso.org/standard/57037.html',
		parameters: {
			gain: 55,
			filter: FILTER_TYPES.BANDPASS,
			velocity: 0.8,
			gateA: {
				enabled: true,
				start: 0,
				width: 120,
				height: 4.5,
				alarmThreshold: 1.3,
				color: COLORS.WAVEFORM_GATE_A
			},
			gateB: {
				enabled: true,
				start: 120,
				width: 120,
				height: 4.5,
				alarmThreshold: 1.8,
				color: COLORS.WAVEFORM_GATE_B
			},
			threshold: 1.0
		}
	},

	'EN-10228': {
		id: 'EN-10228',
		name: 'EN 10228',
		nameEn: 'EN 10228',
		description: '欧洲标准 - 钢锻件无损检测',
		descriptionEn: 'European Standard - Non-destructive Testing of Steel Forgings',
		standard: 'EN-10228',
		referenceUrl: 'https://www.en-standard.eu/bs-en-10228-3-2016-non-destructive-testing-of-steel-forgings-magnetic-particle-inspection/',
		parameters: {
			gain: 65,
			filter: FILTER_TYPES.LOWPASS,
			velocity: 1.2,
			gateA: {
				enabled: true,
				start: 0,
				width: 80,
				height: 6.0,
				alarmThreshold: 1.6,
				color: COLORS.WAVEFORM_GATE_A
			},
			gateB: {
				enabled: true,
				start: 80,
				width: 80,
				height: 6.0,
				alarmThreshold: 2.2,
				color: COLORS.WAVEFORM_GATE_B
			},
			threshold: 1.4
		}
	},

	'ASTM-E709': {
		id: 'ASTM-E709',
		name: 'ASTM E709',
		nameEn: 'ASTM E709',
		description: '美国材料试验协会标准 - 磁粉检测指南',
		descriptionEn: 'ASTM Standard Guide for Magnetic Particle Testing',
		standard: 'ASTM-E709',
		referenceUrl: 'https://www.astm.org/e0709-21.html',
		parameters: {
			gain: 58,
			filter: FILTER_TYPES.BANDPASS,
			velocity: 0.9,
			gateA: {
				enabled: true,
				start: 0,
				width: 110,
				height: 5.5,
				alarmThreshold: 1.4,
				color: COLORS.WAVEFORM_GATE_A
			},
			gateB: {
				enabled: true,
				start: 110,
				width: 110,
				height: 5.5,
				alarmThreshold: 1.9,
				color: COLORS.WAVEFORM_GATE_B
			},
			threshold: 1.1
		}
	},

	'CUSTOM': {
		id: 'CUSTOM',
		name: '自定义',
		nameEn: 'Custom',
		description: '用户自定义参数配置',
		descriptionEn: 'User-defined parameter configuration',
		standard: 'CUSTOM',
		parameters: {
			gain: 40,
			filter: FILTER_TYPES.BANDPASS,
			velocity: 1.0,
			gateA: {
				enabled: true,
				start: 0,
				width: 100,
				height: 5.0,
				alarmThreshold: 1.5,
				color: COLORS.WAVEFORM_GATE_A
			},
			gateB: {
				enabled: true,
				start: 100,
				width: 100,
				height: 5.0,
				alarmThreshold: 2.0,
				color: COLORS.WAVEFORM_GATE_B
			},
			threshold: 1.0
		}
	}
};

/**
 * 获取所有标准预设列表 / Get all standard presets
 */
export function getAllPresets(): StandardPreset[] {
	return Object.values(STANDARD_PRESETS);
}

/**
 * 根据ID获取标准预设 / Get standard preset by ID
 */
export function getPresetById(id: string): StandardPreset | undefined {
	return STANDARD_PRESETS[id];
}

/**
 * 获取标准预设的参数 / Get parameters from standard preset
 */
export function getPresetParameters(id: string): TestingParameters | undefined {
	const preset = getPresetById(id);
	return preset ? { ...preset.parameters } : undefined;
}

/**
 * 检查参数是否匹配某个标准预设 / Check if parameters match a standard preset
 */
export function matchPreset(parameters: TestingParameters): string | null {
	for (const [id, preset] of Object.entries(STANDARD_PRESETS)) {
		if (id === 'CUSTOM') continue;

		const presetParams = preset.parameters;
		if (
			Math.abs(parameters.gain - presetParams.gain) < 0.1 &&
			parameters.filter === presetParams.filter &&
			Math.abs(parameters.velocity - presetParams.velocity) < 0.01 &&
			Math.abs(parameters.threshold - presetParams.threshold) < 0.01
		) {
			return id;
		}
	}
	return 'CUSTOM';
}
