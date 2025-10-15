/**
 * Testing Store Usage Examples
 * 
 * This file demonstrates how to use the testingStore
 * Note: This is an example file, not actual unit tests
 */

import { get } from 'svelte/store';
import { testingStore, isTesting, isPaused, testingStats } from '../testing';
import type { TestingParameters } from '$lib/types/signal';

/**
 * Example 1: Start a new testing session
 */
export async function example1_StartTesting() {
	console.log('=== Example 1: Start Testing ===');
	
	// Define testing parameters
	const parameters: TestingParameters = {
		gain: 60,
		filter: 'bandpass',
		velocity: 1.0,
		gateA: {
			enabled: true,
			start: 0,
			width: 1.0,
			height: 5.0,
			alarmThreshold: 1.5,
			color: '#FFD700'
		},
		gateB: {
			enabled: true,
			start: 1.0,
			width: 1.0,
			height: 5.0,
			alarmThreshold: 2.0,
			color: '#FF69B4'
		},
		threshold: 1.0
	};
	
	// Start testing
	const result = await testingStore.startTesting('Test Project 1', parameters);
	
	if (result.success) {
		console.log('Testing started successfully');
		console.log('Session ID:', result.sessionId);
		
		// Check if testing is running
		const isRunning = get(isTesting);
		console.log('Is testing:', isRunning);
	} else {
		console.error('Failed to start testing:', result.error);
	}
}

/**
 * Example 2: Monitor testing progress
 */
export function example2_MonitorProgress() {
	console.log('\n=== Example 2: Monitor Progress ===');
	
	// Subscribe to testing stats
	const unsubscribe = testingStats.subscribe(stats => {
		console.log('Testing Statistics:');
		console.log('  Duration:', stats.duration);
		console.log('  Samples Collected:', stats.samplesCollected);
		console.log('  Defects Detected:', stats.defectsDetected);
		console.log('  Sampling Rate:', stats.samplingRate, 'Hz');
	});
	
	// Unsubscribe after some time
	setTimeout(() => {
		unsubscribe();
		console.log('Stopped monitoring progress');
	}, 5000);
}

/**
 * Example 3: Pause and resume testing
 */
export async function example3_PauseResume() {
	console.log('\n=== Example 3: Pause and Resume ===');
	
	// Check if testing is running
	if (!get(isTesting)) {
		console.log('No active testing session');
		return;
	}
	
	// Pause testing
	console.log('Pausing testing...');
	testingStore.pauseTesting();
	
	const paused = get(isPaused);
	console.log('Is paused:', paused);
	
	// Wait 2 seconds
	await new Promise(resolve => setTimeout(resolve, 2000));
	
	// Resume testing
	console.log('Resuming testing...');
	testingStore.resumeTesting();
	
	const running = get(isTesting);
	console.log('Is testing:', running);
}

/**
 * Example 4: Update testing parameters during testing
 */
export async function example4_UpdateParameters() {
	console.log('\n=== Example 4: Update Parameters ===');
	
	const state = get(testingStore);
	if (!state.currentSession) {
		console.log('No active testing session');
		return;
	}
	
	console.log('Current gain:', state.currentSession.parameters.gain);
	console.log('Current filter:', state.currentSession.parameters.filter);
	
	// Update parameters
	await testingStore.updateParameters({
		gain: 80,
		filter: 'lowpass'
	});
	
	const updatedState = get(testingStore);
	console.log('Updated gain:', updatedState.currentSession?.parameters.gain);
	console.log('Updated filter:', updatedState.currentSession?.parameters.filter);
}

/**
 * Example 5: Stop testing and save data
 */
export async function example5_StopTesting() {
	console.log('\n=== Example 5: Stop Testing ===');
	
	if (!get(isTesting) && !get(isPaused)) {
		console.log('No active testing session');
		return;
	}
	
	const state = get(testingStore);
	console.log('Stopping testing...');
	console.log('Samples collected:', state.progress.samplesCollected);
	console.log('Defects detected:', state.progress.defectsDetected);
	
	const result = await testingStore.stopTesting();
	
	if (result.success) {
		console.log('Testing stopped successfully');
		console.log('All data saved to database');
	} else {
		console.error('Failed to stop testing:', result.error);
	}
}

/**
 * Example 6: Load historical session
 */
export async function example6_LoadHistoricalSession(sessionId: string) {
	console.log('\n=== Example 6: Load Historical Session ===');
	
	console.log('Loading session:', sessionId);
	
	const result = await testingStore.loadSession(sessionId);
	
	if (result.success) {
		const state = get(testingStore);
		console.log('Session loaded successfully');
		console.log('Project:', state.currentSession?.projectName);
		console.log('Status:', state.currentSession?.status);
		console.log('Samples:', state.progress.samplesCollected);
		console.log('Defects:', state.progress.defectsDetected);
		console.log('Duration:', state.progress.duration, 'seconds');
	} else {
		console.error('Failed to load session:', result.error);
	}
}

/**
 * Example 7: Monitor real-time signal data
 */
export function example7_MonitorSignalData() {
	console.log('\n=== Example 7: Monitor Signal Data ===');
	
	let sampleCount = 0;
	
	// Subscribe to testing store
	const unsubscribe = testingStore.subscribe(state => {
		if (state.processedBuffer.length > sampleCount) {
			const newSamples = state.processedBuffer.slice(sampleCount);
			sampleCount = state.processedBuffer.length;
			
			console.log(`Received ${newSamples.length} new samples`);
			
			// Display latest sample
			if (newSamples.length > 0) {
				const latest = newSamples[newSamples.length - 1];
				console.log('  Latest sample:');
				console.log('    Position:', latest.position.toFixed(3));
				console.log('    Amplitude:', latest.amplitude.toFixed(3));
				console.log('    Phase:', latest.phase.toFixed(2), '°');
			}
		}
	});
	
	// Unsubscribe after some time
	setTimeout(() => {
		unsubscribe();
		console.log('Stopped monitoring signal data');
	}, 10000);
}

/**
 * Example 8: Monitor defect detection
 */
export function example8_MonitorDefects() {
	console.log('\n=== Example 8: Monitor Defects ===');
	
	let defectCount = 0;
	
	// Subscribe to testing store
	const unsubscribe = testingStore.subscribe(state => {
		if (state.defects.length > defectCount) {
			const newDefects = state.defects.slice(defectCount);
			defectCount = state.defects.length;
			
			console.log(`Detected ${newDefects.length} new defect(s)`);
			
			newDefects.forEach((defect, index) => {
				console.log(`  Defect ${defectCount - newDefects.length + index + 1}:`);
				console.log('    Position:', defect.position.toFixed(3));
				console.log('    Amplitude:', defect.amplitude.toFixed(3));
				console.log('    Severity:', defect.severity);
				console.log('    Gate:', defect.gateTriggered);
			});
		}
	});
	
	// Unsubscribe after some time
	setTimeout(() => {
		unsubscribe();
		console.log('Stopped monitoring defects');
	}, 10000);
}

/**
 * Example 9: Complete testing workflow
 */
export async function example9_CompleteWorkflow() {
	console.log('\n=== Example 9: Complete Testing Workflow ===');
	
	try {
		// 1. Start testing
		console.log('1. Starting testing...');
		const startResult = await testingStore.startTesting('Complete Workflow Test');
		if (!startResult.success) throw new Error(startResult.error);
		console.log('   ✓ Testing started');
		
		// 2. Wait for some data collection
		console.log('2. Collecting data...');
		await new Promise(resolve => setTimeout(resolve, 3000));
		
		const state1 = get(testingStore);
		console.log(`   ✓ Collected ${state1.progress.samplesCollected} samples`);
		
		// 3. Pause testing
		console.log('3. Pausing testing...');
		testingStore.pauseTesting();
		console.log('   ✓ Testing paused');
		
		// 4. Update parameters
		console.log('4. Updating parameters...');
		await testingStore.updateParameters({ gain: 70 });
		console.log('   ✓ Parameters updated');
		
		// 5. Resume testing
		console.log('5. Resuming testing...');
		testingStore.resumeTesting();
		console.log('   ✓ Testing resumed');
		
		// 6. Wait for more data
		console.log('6. Collecting more data...');
		await new Promise(resolve => setTimeout(resolve, 3000));
		
		const state2 = get(testingStore);
		console.log(`   ✓ Total samples: ${state2.progress.samplesCollected}`);
		console.log(`   ✓ Defects detected: ${state2.progress.defectsDetected}`);
		
		// 7. Stop testing
		console.log('7. Stopping testing...');
		const stopResult = await testingStore.stopTesting();
		if (!stopResult.success) throw new Error(stopResult.error);
		console.log('   ✓ Testing stopped');
		
		// 8. Display final statistics
		const finalStats = get(testingStats);
		console.log('8. Final Statistics:');
		console.log(`   Duration: ${finalStats.duration}`);
		console.log(`   Samples: ${finalStats.samplesCollected}`);
		console.log(`   Defects: ${finalStats.defectsDetected}`);
		console.log(`   Avg Rate: ${finalStats.samplingRate} Hz`);
		
		console.log('\n✓ Complete workflow finished successfully');
	} catch (error) {
		console.error('Workflow failed:', error);
	}
}

/**
 * Example 10: Using derived stores in Svelte components
 */
export function example10_SvelteComponentUsage() {
	console.log('\n=== Example 10: Svelte Component Usage ===');
	
	console.log(`
In a Svelte component, you can use the stores like this:

<script lang="ts">
  import { testingStore, isTesting, isPaused, testingStats } from '$lib/stores';
  
  // Subscribe to stores (auto-unsubscribe when component is destroyed)
  $: isRunning = $isTesting;
  $: paused = $isPaused;
  $: stats = $testingStats;
  $: currentSession = $testingStore.currentSession;
  $: defects = $testingStore.defects;
  
  async function handleStart() {
    await testingStore.startTesting('My Project');
  }
  
  function handlePause() {
    testingStore.pauseTesting();
  }
  
  function handleResume() {
    testingStore.resumeTesting();
  }
  
  async function handleStop() {
    await testingStore.stopTesting();
  }
</script>

<div>
  <h2>{currentSession?.projectName || 'No Session'}</h2>
  
  <div class="stats">
    <p>Duration: {stats.duration}</p>
    <p>Samples: {stats.samplesCollected}</p>
    <p>Defects: {stats.defectsDetected}</p>
    <p>Rate: {stats.samplingRate} Hz</p>
  </div>
  
  <div class="controls">
    {#if !isRunning && !paused}
      <button on:click={handleStart}>Start</button>
    {/if}
    
    {#if isRunning}
      <button on:click={handlePause}>Pause</button>
      <button on:click={handleStop}>Stop</button>
    {/if}
    
    {#if paused}
      <button on:click={handleResume}>Resume</button>
      <button on:click={handleStop}>Stop</button>
    {/if}
  </div>
  
  <div class="defects">
    <h3>Defects ({defects.length})</h3>
    {#each defects as defect}
      <div class="defect {defect.severity}">
        <span>Position: {defect.position.toFixed(3)}</span>
        <span>Amplitude: {defect.amplitude.toFixed(3)}</span>
        <span>Severity: {defect.severity}</span>
      </div>
    {/each}
  </div>
</div>
	`);
}

/**
 * Run all examples (for demonstration purposes)
 */
export async function runAllExamples() {
	// Note: These examples should be run individually in a real application
	// as they depend on authentication and database state
	
	console.log('Testing Store Examples');
	console.log('======================\n');
	
	example10_SvelteComponentUsage();
	
	// Uncomment to run other examples:
	// await example1_StartTesting();
	// example2_MonitorProgress();
	// await example3_PauseResume();
	// await example4_UpdateParameters();
	// await example5_StopTesting();
	// await example6_LoadHistoricalSession('session-id-here');
	// example7_MonitorSignalData();
	// example8_MonitorDefects();
	// await example9_CompleteWorkflow();
}

