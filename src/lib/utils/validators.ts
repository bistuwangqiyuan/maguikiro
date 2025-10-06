/**
 * 数据验证工具函数 / Data Validation Utilities
 */

import { MAX_GAIN_DB, MIN_GAIN_DB, MAX_GATE_WIDTH, MIN_GATE_WIDTH } from './constants';

/**
 * 验证增益值范围 / Validate gain value range
 */
export function validateGain(gain: number): boolean {
  return gain >= MIN_GAIN_DB && gain <= MAX_GAIN_DB;
}

/**
 * 验证闸门宽度 / Validate gate width
 */
export function validateGateWidth(width: number): boolean {
  return width >= MIN_GATE_WIDTH && width <= MAX_GATE_WIDTH;
}

/**
 * 验证必填字段 / Validate required fields
 */
export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * 验证数字范围 / Validate number range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 验证邮箱格式 / Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证项目名称 / Validate project name
 */
export function validateProjectName(name: string): boolean {
  return name.length >= 3 && name.length <= 100;
}
