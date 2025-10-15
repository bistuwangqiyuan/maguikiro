/**
 * Signal Generation and Data Acquisition Example
 * 
 * This file demonstrates how to use the signal generation and data acquisition services.
 * It's not a unit test, but rather a usage example and integration demonstration.
 */

import { SignalGenerator } from '../signal-generator';
import { DataAcquisitionService } from '../data-acquisition';
import type { SignalData, DefectConfig } from '$lib/types/signal';

/**
 * Example 1: Basic Signal Generation
 */
export function exampleBasicSignalGeneration() {
  console.log('=== Example 1: Basic Signal Generation ===');
  
  // Create a signal generator with default parameters
  const generator = new SignalGenerator(100, 1.0, 0.1);
  
  // Generate a single signal at time 0
  const signal = generator.generateSignal(0);
  console.log('Signal at t=0:', signal);
  
  // Generate a batch of signals
  const batch = generator.generateBatch(0, 10, 0.01);
  console.log(`Generated ${batch.length} signals`);
  console.log('First signal:', batch[0]);
  console.log('Last signal:', batch[batch.length - 1]);
}

/**
 * Example 2: Signal Generation with Defects
 */
export function exampleSignalWithDefects() {
  console.log('\n=== Example 2: Signal Generation with Defects ===');
  
  const generator = new SignalGenerator(100, 1.0, 0.05);
  
  // Define defects
  const defects: DefectConfig[] = [
    { position: 0.5, amplitude: 2.0, width: 0.01 },
    { position: 1.2, amplitude: 1.5, width: 0.015 },
    { position: 2.0, amplitude: 3.0, width: 0.02 }
  ];
  
  generator.setDefects(defects);
  
  // Generate signals around defect positions
  console.log('Signal before defect (t=0.4):', generator.generateSignal(0.4));
  console.log('Signal at defect (t=0.5):', generator.generateSignal(0.5));
  console.log('Signal after defect (t=0.6):', generator.generateSignal(0.6));
}

/**
 * Example 3: Data Acquisition Service
 */
export function exampleDataAcquisition() {
  console.log('\n=== Example 3: Data Acquisition Service ===');
  
  const daq = new DataAcquisitionService({
    samplingRate: 100,
    frequency: 100,
    amplitude: 1.0,
    noiseLevel: 0.1,
    defects: [
      { position: 0.5, amplitude: 2.0, width: 0.01 }
    ]
  });
  
  let dataCount = 0;
  const maxSamples = 50;
  
  // Register callback
  daq.onData((data: SignalData) => {
    dataCount++;
    if (dataCount <= 5 || dataCount === maxSamples) {
      console.log(`Sample ${dataCount}:`, {
        time: data.position.toFixed(3),
        amplitude: data.amplitude.toFixed(4),
        phase: data.phase.toFixed(2)
      });
    }
    
    // Stop after collecting enough samples
    if (dataCount >= maxSamples) {
      daq.stop();
      console.log(`\nAcquisition stopped after ${dataCount} samples`);
      console.log('Status:', daq.getStatus());
    }
  });
  
  // Start acquisition
  console.log('Starting data acquisition...');
  daq.start();
  console.log('Initial status:', daq.getStatus());
}

/**
 * Example 4: Pause and Resume
 */
export function examplePauseResume() {
  console.log('\n=== Example 4: Pause and Resume ===');
  
  const daq = new DataAcquisitionService({
    samplingRate: 50,
    frequency: 100
  });
  
  let sampleCount = 0;
  
  daq.onData(() => {
    sampleCount++;
    
    // Pause after 10 samples
    if (sampleCount === 10) {
      console.log('Pausing after 10 samples...');
      daq.pause();
      console.log('Status:', daq.getStatus());
      
      // Resume after 1 second
      setTimeout(() => {
        console.log('Resuming...');
        daq.resume();
        console.log('Status:', daq.getStatus());
      }, 1000);
    }
    
    // Stop after 20 samples
    if (sampleCount === 20) {
      console.log('Stopping after 20 samples');
      daq.stop();
    }
  });
  
  daq.start();
}

/**
 * Example 5: Dynamic Configuration Update
 */
export function exampleDynamicConfig() {
  console.log('\n=== Example 5: Dynamic Configuration Update ===');
  
  const daq = new DataAcquisitionService({
    samplingRate: 100,
    frequency: 100,
    amplitude: 1.0
  });
  
  let sampleCount = 0;
  
  daq.onData((data: SignalData) => {
    sampleCount++;
    
    if (sampleCount === 1) {
      console.log('Initial signal:', {
        amplitude: data.amplitude.toFixed(4),
        frequency: data.frequency
      });
    }
    
    // Update configuration after 25 samples
    if (sampleCount === 25) {
      console.log('\nUpdating configuration...');
      daq.updateConfig({
        amplitude: 2.0,
        frequency: 200,
        defects: [
          { position: daq.getCurrentTime() + 0.1, amplitude: 3.0, width: 0.02 }
        ]
      });
      console.log('Configuration updated');
    }
    
    if (sampleCount === 26) {
      console.log('Signal after config update:', {
        amplitude: data.amplitude.toFixed(4),
        frequency: data.frequency
      });
    }
    
    // Stop after 50 samples
    if (sampleCount === 50) {
      daq.stop();
      console.log('\nAcquisition complete');
    }
  });
  
  daq.start();
}

/**
 * Example 6: Simulating Real Testing Session
 */
export function exampleTestingSession() {
  console.log('\n=== Example 6: Simulating Real Testing Session ===');
  
  // Simulate a testing session with multiple defects
  const defects: DefectConfig[] = [
    { position: 1.0, amplitude: 2.5, width: 0.01 },
    { position: 2.5, amplitude: 1.8, width: 0.012 },
    { position: 4.0, amplitude: 3.2, width: 0.015 },
    { position: 5.5, amplitude: 2.0, width: 0.01 }
  ];
  
  const daq = new DataAcquisitionService({
    samplingRate: 100,
    frequency: 100,
    amplitude: 1.0,
    noiseLevel: 0.08,
    defects
  });
  
  const dataBuffer: SignalData[] = [];
  const detectedDefects: { position: number; amplitude: number }[] = [];
  const defectThreshold = 2.0;
  
  daq.onData((data: SignalData) => {
    // Add to buffer
    dataBuffer.push(data);
    
    // Detect defects (simple threshold-based detection)
    if (Math.abs(data.amplitude) > defectThreshold) {
      // Check if this is a new defect (not too close to previous ones)
      const isNewDefect = detectedDefects.every(
        d => Math.abs(d.position - data.position) > 0.1
      );
      
      if (isNewDefect) {
        detectedDefects.push({
          position: data.position,
          amplitude: data.amplitude
        });
        console.log(`Defect detected at position ${data.position.toFixed(3)}, amplitude: ${data.amplitude.toFixed(4)}`);
      }
    }
    
    // Stop after 6 seconds of data
    if (data.position >= 6.0) {
      daq.stop();
      
      console.log('\n=== Testing Session Summary ===');
      console.log(`Total samples collected: ${dataBuffer.length}`);
      console.log(`Defects detected: ${detectedDefects.length}`);
      console.log(`Expected defects: ${defects.length}`);
      console.log('Detection accuracy:', 
        `${(detectedDefects.length / defects.length * 100).toFixed(1)}%`);
    }
  });
  
  console.log('Starting testing session...');
  console.log(`Configured ${defects.length} defects`);
  daq.start();
}

/**
 * Run all examples
 */
export function runAllExamples() {
  exampleBasicSignalGeneration();
  exampleSignalWithDefects();
  
  // Note: The following examples use timers and should be run separately
  // or with proper async handling in a real application
  
  // exampleDataAcquisition();
  // examplePauseResume();
  // exampleDynamicConfig();
  // exampleTestingSession();
}
