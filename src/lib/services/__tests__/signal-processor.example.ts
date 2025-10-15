/**
 * Signal Processor Usage Examples
 * 
 * This file demonstrates how to use the SignalProcessor service
 * Note: This is an example file, not actual unit tests
 */

import { SignalProcessor } from '../signal-processor';
import { SignalGenerator } from '../signal-generator';
import type { SignalData, GateConfig } from '$lib/types/signal';

/**
 * Example 1: Basic signal processing with gain and filter
 */
export function example1_BasicProcessing() {
  console.log('=== Example 1: Basic Signal Processing ===');
  
  // Create signal generator
  const generator = new SignalGenerator(100, 1.0, 0.1);
  
  // Generate some raw signals
  const rawSignals = generator.generateBatch(0, 10, 0.01);
  
  // Create processor
  const processor = new SignalProcessor();
  
  // Set gain to 40 dB
  processor.setGain(40);
  
  // Set lowpass filter
  processor.setFilter('lowpass');
  
  // Process signals
  const processedSignals = processor.processBatch(rawSignals);
  
  console.log('Raw signal amplitude:', rawSignals[0].amplitude);
  console.log('Processed signal amplitude:', processedSignals[0].amplitude);
  console.log('Gain applied: ~100x (40 dB)');
}

/**
 * Example 2: Defect detection with gates
 */
export function example2_DefectDetection() {
  console.log('\n=== Example 2: Defect Detection ===');
  
  // Create signal generator with defects
  const generator = new SignalGenerator(100, 1.0, 0.05);
  generator.setDefects([
    { position: 0.5, amplitude: 2.0, width: 0.01 },
    { position: 1.5, amplitude: 3.0, width: 0.015 }
  ]);
  
  // Generate signals
  const signals = generator.generateBatch(0, 200, 0.01);
  
  // Create processor
  const processor = new SignalProcessor();
  processor.setGain(20); // 20 dB gain
  processor.setFilter('bandpass');
  
  // Process signals
  const processedSignals = processor.processBatch(signals);
  
  // Configure gates
  const gateA: GateConfig = {
    enabled: true,
    start: 0,
    width: 1.0,
    height: 10.0,
    alarmThreshold: 1.5,
    color: '#FFD700'
  };
  
  const gateB: GateConfig = {
    enabled: true,
    start: 1.0,
    width: 1.0,
    height: 10.0,
    alarmThreshold: 2.0,
    color: '#FF69B4'
  };
  
  // Detect defects
  const defects = processor.detectDefects(
    processedSignals,
    1.0, // threshold
    gateA,
    gateB
  );
  
  console.log(`Detected ${defects.length} defects:`);
  defects.forEach(defect => {
    console.log(`  - Position: ${defect.position.toFixed(3)}, ` +
                `Amplitude: ${defect.amplitude.toFixed(3)}, ` +
                `Severity: ${defect.severity}, ` +
                `Gate: ${defect.gateTriggered}`);
  });
}

/**
 * Example 3: Processing pipeline
 */
export function example3_ProcessingPipeline() {
  console.log('\n=== Example 3: Processing Pipeline ===');
  
  // Create signal generator
  const generator = new SignalGenerator(100, 1.0, 0.1);
  const rawSignals = generator.generateBatch(0, 50, 0.01);
  
  // Create processor
  const processor = new SignalProcessor();
  
  // Create pipeline with 60 dB gain and bandpass filter
  const pipeline = processor.createPipeline(60, 'bandpass');
  
  // Process signals through pipeline
  const processedSignals = pipeline(rawSignals);
  
  console.log('Pipeline applied: 60 dB gain + bandpass filter');
  console.log('Processed signals count:', processedSignals.length);
  console.log('First signal amplitude:', processedSignals[0].amplitude.toFixed(3));
}

/**
 * Example 4: Different filter types comparison
 */
export function example4_FilterComparison() {
  console.log('\n=== Example 4: Filter Types Comparison ===');
  
  // Create signal generator
  const generator = new SignalGenerator(100, 1.0, 0.2); // Higher noise
  const rawSignals = generator.generateBatch(0, 20, 0.01);
  
  const filterTypes: Array<'none' | 'lowpass' | 'highpass' | 'bandpass'> = 
    ['none', 'lowpass', 'highpass', 'bandpass'];
  
  filterTypes.forEach(filterType => {
    const processor = new SignalProcessor();
    processor.setGain(0); // 0 dB (no gain)
    processor.setFilter(filterType);
    
    const processed = processor.processBatch(rawSignals);
    const avgAmplitude = processed.reduce((sum, s) => sum + Math.abs(s.amplitude), 0) / processed.length;
    
    console.log(`${filterType.padEnd(10)}: avg amplitude = ${avgAmplitude.toFixed(4)}`);
  });
}

/**
 * Example 5: Real-time processing simulation
 */
export function example5_RealTimeProcessing() {
  console.log('\n=== Example 5: Real-time Processing Simulation ===');
  
  const generator = new SignalGenerator(100, 1.0, 0.1);
  generator.setDefects([
    { position: 0.3, amplitude: 2.5, width: 0.01 }
  ]);
  
  const processor = new SignalProcessor();
  processor.setGain(40);
  processor.setFilter('lowpass');
  
  const gateA: GateConfig = {
    enabled: true,
    start: 0,
    width: 1.0,
    height: 10.0,
    alarmThreshold: 2.0,
    color: '#FFD700'
  };
  
  const gateB: GateConfig = {
    enabled: false,
    start: 0,
    width: 0,
    height: 0,
    alarmThreshold: 0,
    color: '#FF69B4'
  };
  
  let time = 0;
  const interval = 0.01;
  const processedBuffer: SignalData[] = [];
  
  console.log('Simulating real-time processing...');
  
  // Simulate 100 samples
  for (let i = 0; i < 100; i++) {
    // Generate signal
    const rawSignal = generator.generateSignal(time);
    
    // Process signal
    const processedSignal = processor.processSignal(rawSignal);
    processedBuffer.push(processedSignal);
    
    // Check for defects every 10 samples
    if (processedBuffer.length >= 10) {
      const defects = processor.detectDefects(
        processedBuffer,
        1.5,
        gateA,
        gateB
      );
      
      if (defects.length > 0) {
        console.log(`  Time ${time.toFixed(2)}s: Detected ${defects.length} defect(s)`);
        defects.forEach(d => {
          console.log(`    - Severity: ${d.severity}, Amplitude: ${d.amplitude.toFixed(3)}`);
        });
      }
      
      processedBuffer.length = 0; // Clear buffer
    }
    
    time += interval;
  }
  
  console.log('Real-time processing simulation complete');
}

/**
 * Run all examples
 */
export function runAllExamples() {
  example1_BasicProcessing();
  example2_DefectDetection();
  example3_ProcessingPipeline();
  example4_FilterComparison();
  example5_RealTimeProcessing();
}

// Uncomment to run examples:
// runAllExamples();

