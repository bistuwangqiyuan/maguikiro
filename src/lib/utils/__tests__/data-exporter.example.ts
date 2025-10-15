/**
 * 数据导出器使用示例 / Data Exporter Usage Examples
 * 
 * 这个文件展示了如何使用 DataExporter 类
 * This file demonstrates how to use the DataExporter class
 */

import { DataExporter } from '../data-exporter';
import type { CompleteSessionData } from '$lib/types/session';
import type { SignalData, Defect } from '$lib/types/signal';

/**
 * 示例1：创建测试数据 / Example 1: Create test data
 */
function createSampleSession(): CompleteSessionData {
	// 生成示例信号数据
	const signalData: SignalData[] = [];
	for (let i = 0; i < 100; i++) {
		signalData.push({
			timestamp: Date.now() + i * 10,
			position: i * 0.1,
			amplitude: Math.sin(i * 0.1) + Math.random() * 0.1,
			phase: Math.random() * Math.PI * 2,
			frequency: 100
		});
	}

	// 生成示例缺陷数据
	const defects: Defect[] = [
		{
			id: 'defect-1',
			position: 2.5,
			amplitude: 2.3,
			severity: 'high',
			timestamp: new Date(),
			gateTriggered: 'A',
			notes: 'Crack detected at weld joint'
		},
		{
			id: 'defect-2',
			position: 5.8,
			amplitude: 1.8,
			severity: 'medium',
			timestamp: new Date(),
			gateTriggered: 'B',
			notes: 'Surface irregularity'
		}
	];

	// 创建完整会话数据
	const session: CompleteSessionData = {
		id: 'abc123-def456-ghi789',
		projectName: 'Pipeline Inspection 2024',
		operatorId: 'user-001',
		startTime: new Date('2024-01-15T10:00:00Z'),
		endTime: new Date('2024-01-15T11:30:00Z'),
		status: 'completed',
		parameters: {
			gain: 60,
			filter: 'bandpass',
			velocity: 1.5,
			threshold: 0.8,
			gateA: {
				enabled: true,
				start: 0,
				width: 100,
				height: 2.0,
				alarmThreshold: 1.5,
				color: '#FFD700'
			},
			gateB: {
				enabled: true,
				start: 50,
				width: 80,
				height: 1.8,
				alarmThreshold: 1.3,
				color: '#FF69B4'
			}
		},
		metadata: {
			location: 'Site A',
			temperature: 25,
			humidity: 60
		},
		createdAt: new Date('2024-01-15T10:00:00Z'),
		updatedAt: new Date('2024-01-15T11:30:00Z'),
		signalData,
		defects
	};

	return session;
}

/**
 * 示例2：导出为CSV格式 / Example 2: Export to CSV
 */
export function exampleExportToCSV() {
	const session = createSampleSession();

	// 导出完整数据
	DataExporter.exportSession(session, {
		format: 'csv',
		includeSignalData: true,
		includeDefects: true,
		includeParameters: true
	});

	console.log('CSV export completed');
}

/**
 * 示例3：导出为Excel格式 / Example 3: Export to Excel
 */
export function exampleExportToExcel() {
	const session = createSampleSession();

	// 导出为Excel（多个工作表）
	DataExporter.exportSession(session, {
		format: 'excel',
		includeSignalData: true,
		includeDefects: true,
		includeParameters: true
	});

	console.log('Excel export completed');
}

/**
 * 示例4：导出为JSON格式 / Example 4: Export to JSON
 */
export function exampleExportToJSON() {
	const session = createSampleSession();

	// 导出为JSON
	DataExporter.exportSession(session, {
		format: 'json'
	});

	console.log('JSON export completed');
}

/**
 * 示例5：仅导出缺陷数据 / Example 5: Export defects only
 */
export function exampleExportDefectsOnly() {
	const session = createSampleSession();

	// 仅导出缺陷数据（不包含信号数据）
	DataExporter.exportSession(session, {
		format: 'excel',
		includeSignalData: false,
		includeDefects: true,
		includeParameters: true
	});

	console.log('Defects-only export completed');
}

/**
 * 示例6：批量导出多个会话 / Example 6: Batch export multiple sessions
 */
export function exampleBatchExport() {
	// 创建多个会话
	const sessions: CompleteSessionData[] = [];
	for (let i = 0; i < 5; i++) {
		const session = createSampleSession();
		session.id = `session-${i + 1}`;
		session.projectName = `Project ${i + 1}`;
		sessions.push(session);
	}

	// 批量导出为Excel
	DataExporter.exportMultipleSessions(sessions, {
		format: 'excel',
		includeSignalData: true,
		includeDefects: true,
		includeParameters: true
	});

	console.log('Batch export completed');
}

/**
 * 示例7：在Svelte组件中使用 / Example 7: Usage in Svelte component
 */
export const svelteComponentExample = `
<script lang="ts">
  import { DataExporter } from '$lib/utils/data-exporter';
  import { supabaseService } from '$lib/services/supabase';
  import type { CompleteSessionData } from '$lib/types/session';
  
  let selectedSessionId = '';
  let exportFormat: 'csv' | 'excel' | 'json' = 'excel';
  let includeSignalData = true;
  let includeDefects = true;
  let includeParameters = true;
  
  async function handleExport() {
    try {
      // 从数据库获取完整会话数据
      const sessionData = await supabaseService.getCompleteSessionData(selectedSessionId);
      
      // 导出数据
      DataExporter.exportSession(sessionData, {
        format: exportFormat,
        includeSignalData,
        includeDefects,
        includeParameters
      });
      
      alert('导出成功！');
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    }
  }
  
  async function handleBatchExport(sessionIds: string[]) {
    try {
      // 获取所有会话数据
      const sessions = await Promise.all(
        sessionIds.map(id => supabaseService.getCompleteSessionData(id))
      );
      
      // 批量导出
      DataExporter.exportMultipleSessions(sessions, {
        format: 'excel',
        includeSignalData: true,
        includeDefects: true,
        includeParameters: true
      });
      
      alert(\`成功导出 \${sessions.length} 个会话！\`);
    } catch (error) {
      console.error('Batch export failed:', error);
      alert('批量导出失败，请重试');
    }
  }
</script>

<div class="export-panel">
  <h3>数据导出</h3>
  
  <div class="form-group">
    <label>导出格式：</label>
    <select bind:value={exportFormat}>
      <option value="csv">CSV</option>
      <option value="excel">Excel</option>
      <option value="json">JSON</option>
    </select>
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" bind:checked={includeSignalData} />
      包含信号数据
    </label>
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" bind:checked={includeDefects} />
      包含缺陷数据
    </label>
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" bind:checked={includeParameters} />
      包含参数配置
    </label>
  </div>
  
  <button onclick={handleExport}>导出当前会话</button>
  <button onclick={() => handleBatchExport(selectedSessionIds)}>批量导出</button>
</div>
`;

/**
 * 示例8：错误处理 / Example 8: Error handling
 */
export function exampleErrorHandling() {
	try {
		// 尝试批量导出空数组
		DataExporter.exportMultipleSessions([], {
			format: 'excel',
			includeSignalData: true,
			includeDefects: true,
			includeParameters: true
		});
	} catch (error) {
		console.error('Expected error:', error);
		// 输出: Error: No sessions to export
	}
}

/**
 * 示例9：大数据量优化 / Example 9: Large data optimization
 */
export function exampleLargeDataExport() {
	const session = createSampleSession();

	// 生成大量信号数据（10000点）
	const largeSignalData: SignalData[] = [];
	for (let i = 0; i < 10000; i++) {
		largeSignalData.push({
			timestamp: Date.now() + i * 10,
			position: i * 0.1,
			amplitude: Math.sin(i * 0.1) + Math.random() * 0.1,
			phase: Math.random() * Math.PI * 2,
			frequency: 100
		});
	}
	session.signalData = largeSignalData;

	// 对于大数据量，推荐使用Excel格式
	DataExporter.exportSession(session, {
		format: 'excel',
		includeSignalData: true,
		includeDefects: true,
		includeParameters: true
	});

	console.log('Large data export completed');
}

/**
 * 示例10：自定义导出选项 / Example 10: Custom export options
 */
export function exampleCustomExport() {
	const session = createSampleSession();

	// 场景1：仅导出会话信息和参数（用于配置备份）
	DataExporter.exportSession(session, {
		format: 'json',
		includeSignalData: false,
		includeDefects: false,
		includeParameters: true
	});

	// 场景2：仅导出原始信号数据（用于后续分析）
	DataExporter.exportSession(session, {
		format: 'csv',
		includeSignalData: true,
		includeDefects: false,
		includeParameters: false
	});

	// 场景3：仅导出缺陷报告（用于质量报告）
	DataExporter.exportSession(session, {
		format: 'excel',
		includeSignalData: false,
		includeDefects: true,
		includeParameters: true
	});

	console.log('Custom exports completed');
}
