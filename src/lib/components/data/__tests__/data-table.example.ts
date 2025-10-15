/**
 * DataTable Component - Example Usage and Test Data
 * 
 * This file provides example data and usage patterns for the DataTable component.
 * Use this for testing, development, and documentation purposes.
 */

import type { SignalData } from '$lib/types/signal';

/**
 * Generate sample signal data for testing
 */
export function generateSampleData(count: number = 100): SignalData[] {
	const data: SignalData[] = [];
	const startTime = Date.now();

	for (let i = 0; i < count; i++) {
		const position = i * 0.01; // 10ms intervals
		const baseAmplitude = Math.sin(2 * Math.PI * 100 * position);
		const noise = (Math.random() - 0.5) * 0.1;
		
		// Add some defects at specific positions
		let defectAmplitude = 0;
		if (position > 0.5 && position < 0.52) {
			defectAmplitude = 2.0 * Math.exp(-Math.pow((position - 0.51) / 0.01, 2));
		}
		if (position > 1.2 && position < 1.22) {
			defectAmplitude = 1.8 * Math.exp(-Math.pow((position - 1.21) / 0.01, 2));
		}

		const amplitude = baseAmplitude + noise + defectAmplitude;
		const phase = Math.atan2(amplitude, baseAmplitude) * (180 / Math.PI);

		data.push({
			timestamp: startTime + i * 10,
			amplitude,
			phase,
			position,
			frequency: 100
		});
	}

	return data;
}

/**
 * Generate data with specific characteristics for testing
 */
export function generateTestData(options: {
	count?: number;
	normalOnly?: boolean;
	abnormalOnly?: boolean;
	threshold?: number;
}): SignalData[] {
	const { count = 50, normalOnly = false, abnormalOnly = false, threshold = 1.0 } = options;
	const data: SignalData[] = [];
	const startTime = Date.now();

	for (let i = 0; i < count; i++) {
		const position = i * 0.01;
		let amplitude: number;

		if (normalOnly) {
			// Generate only normal data (below threshold)
			amplitude = (Math.random() * threshold * 0.8) * (Math.random() > 0.5 ? 1 : -1);
		} else if (abnormalOnly) {
			// Generate only abnormal data (above threshold)
			amplitude = (threshold + Math.random() * threshold) * (Math.random() > 0.5 ? 1 : -1);
		} else {
			// Mix of normal and abnormal
			const isAbnormal = Math.random() > 0.8; // 20% abnormal
			if (isAbnormal) {
				amplitude = (threshold + Math.random() * threshold) * (Math.random() > 0.5 ? 1 : -1);
			} else {
				amplitude = (Math.random() * threshold * 0.8) * (Math.random() > 0.5 ? 1 : -1);
			}
		}

		const phase = Math.random() * 360 - 180;

		data.push({
			timestamp: startTime + i * 10,
			amplitude,
			phase,
			position,
			frequency: 100
		});
	}

	return data;
}

/**
 * Example: Basic usage with generated data
 */
export const basicExample = `
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import { generateSampleData } from '$lib/components/data/__tests__/data-table.example';
  
  const sampleData = generateSampleData(100);
</script>

<DataTable data={sampleData} />
`;

/**
 * Example: Custom page size
 */
export const customPageSizeExample = `
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import { testingStore } from '$lib/stores/testing';
</script>

<DataTable pageSize={25} />
`;

/**
 * Example: Without pagination
 */
export const noPaginationExample = `
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import { generateSampleData } from '$lib/components/data/__tests__/data-table.example';
  
  const smallDataset = generateSampleData(15);
</script>

<DataTable data={smallDataset} showPagination={false} />
`;

/**
 * Example: With testing store integration
 */
export const storeIntegrationExample = `
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import { testingStore } from '$lib/stores/testing';
  
  async function startTesting() {
    await testingStore.startTesting('Test Session', {
      gain: 50,
      filter: 'bandpass',
      velocity: 1.0,
      threshold: 1.2,
      gateA: { enabled: true, start: 0, width: 1, height: 5, alarmThreshold: 1.5, color: '#FFD700' },
      gateB: { enabled: true, start: 1, width: 1, height: 5, alarmThreshold: 2.0, color: '#FF69B4' }
    });
  }
</script>

<button on:click={startTesting}>Start Testing</button>

{#if $testingStore.status === 'running'}
  <DataTable />
{/if}
`;

/**
 * Example: In a grid layout
 */
export const gridLayoutExample = `
<script>
  import WaveformChart from '$lib/components/waveform/WaveformChart.svelte';
  import DataTable from '$lib/components/data/DataTable.svelte';
</script>

<div class="testing-layout">
  <div class="waveform-section">
    <h2>Real-time Waveform</h2>
    <WaveformChart />
  </div>
  
  <div class="data-section">
    <h2>Signal Data</h2>
    <DataTable pageSize={15} />
  </div>
</div>

<style>
  .testing-layout {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    height: 100vh;
    padding: 1rem;
  }
  
  .waveform-section,
  .data-section {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  
  h2 {
    margin: 0 0 1rem 0;
    color: var(--primary-orange);
  }
</style>
`;

/**
 * Example: With row selection handler
 */
export const rowSelectionExample = `
<script>
  import DataTable from '$lib/components/data/DataTable.svelte';
  import { generateSampleData } from '$lib/components/data/__tests__/data-table.example';
  
  const data = generateSampleData(50);
  let selectedData = null;
  
  // Note: This requires extending the DataTable component to emit events
  function handleRowSelect(event) {
    selectedData = event.detail.data;
    console.log('Selected:', selectedData);
  }
</script>

<DataTable {data} on:rowSelect={handleRowSelect} />

{#if selectedData}
  <div class="detail-panel">
    <h3>Selected Data Point</h3>
    <p>Position: {selectedData.position.toFixed(3)}s</p>
    <p>Amplitude: {selectedData.amplitude.toFixed(3)}V</p>
    <p>Phase: {selectedData.phase.toFixed(3)}°</p>
  </div>
{/if}
`;

/**
 * Test scenarios for manual testing
 */
export const testScenarios = {
	emptyData: {
		description: 'Test with no data',
		data: [],
		expected: 'Should show "暂无数据" message'
	},
	
	singleRow: {
		description: 'Test with single row',
		data: generateSampleData(1),
		expected: 'Should show one row, no pagination'
	},
	
	singlePage: {
		description: 'Test with data that fits in one page',
		data: generateSampleData(15),
		expected: 'Should show all data, pagination hidden or disabled'
	},
	
	multiplePages: {
		description: 'Test with data spanning multiple pages',
		data: generateSampleData(100),
		expected: 'Should show pagination controls, 5 pages total'
	},
	
	allNormal: {
		description: 'Test with all normal data',
		data: generateTestData({ count: 50, normalOnly: true }),
		expected: 'All rows should have green status badges'
	},
	
	allAbnormal: {
		description: 'Test with all abnormal data',
		data: generateTestData({ count: 50, abnormalOnly: true }),
		expected: 'All rows should have red status badges and red tint'
	},
	
	mixedData: {
		description: 'Test with mixed normal and abnormal data',
		data: generateTestData({ count: 100 }),
		expected: 'Should show mix of green and red status badges'
	},
	
	largePage: {
		description: 'Test with large page size',
		data: generateSampleData(200),
		pageSize: 100,
		expected: 'Should show 100 rows per page, 2 pages total'
	},
	
	smallPage: {
		description: 'Test with small page size',
		data: generateSampleData(100),
		pageSize: 5,
		expected: 'Should show 5 rows per page, 20 pages total'
	}
};

/**
 * Performance test data
 */
export function generateLargeDataset(size: number = 10000): SignalData[] {
	console.time('Generate large dataset');
	const data = generateSampleData(size);
	console.timeEnd('Generate large dataset');
	return data;
}

/**
 * Sorting test data
 */
export const sortingTestData: SignalData[] = [
	{ timestamp: 1000, amplitude: 0.5, phase: 45, position: 0.1, frequency: 100 },
	{ timestamp: 1010, amplitude: -0.3, phase: -30, position: 0.2, frequency: 100 },
	{ timestamp: 1020, amplitude: 1.2, phase: 90, position: 0.3, frequency: 100 },
	{ timestamp: 1030, amplitude: 0.8, phase: 60, position: 0.4, frequency: 100 },
	{ timestamp: 1040, amplitude: -0.9, phase: -45, position: 0.5, frequency: 100 }
];

/**
 * Expected sorting results
 */
export const sortingExpectations = {
	byAmplitudeAsc: [-0.9, -0.3, 0.5, 0.8, 1.2],
	byAmplitudeDesc: [1.2, 0.8, 0.5, -0.3, -0.9],
	byPhaseAsc: [-45, -30, 45, 60, 90],
	byPhaseDesc: [90, 60, 45, -30, -45],
	byPositionAsc: [0.1, 0.2, 0.3, 0.4, 0.5],
	byPositionDesc: [0.5, 0.4, 0.3, 0.2, 0.1]
};

/**
 * Utility function to verify sorting
 */
export function verifySorting(
	data: SignalData[],
	column: keyof SignalData,
	direction: 'asc' | 'desc'
): boolean {
	for (let i = 0; i < data.length - 1; i++) {
		const current = data[i][column] as number;
		const next = data[i + 1][column] as number;
		
		if (direction === 'asc' && current > next) return false;
		if (direction === 'desc' && current < next) return false;
	}
	
	return true;
}

/**
 * Utility function to count abnormal data
 */
export function countAbnormal(data: SignalData[], threshold: number): number {
	return data.filter(d => Math.abs(d.amplitude) > threshold).length;
}

/**
 * Export all for easy testing
 */
export default {
	generateSampleData,
	generateTestData,
	generateLargeDataset,
	testScenarios,
	sortingTestData,
	sortingExpectations,
	verifySorting,
	countAbnormal
};
