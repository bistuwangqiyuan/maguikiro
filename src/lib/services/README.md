# Services

This directory contains business logic services for the magnetic testing instrument application.

## Signal Generator Service

**File:** `signal-generator.ts`

Generates simulated magnetic testing signals including:
- Base sine wave signals with configurable frequency and amplitude
- Gaussian pulse defect signals
- Noise simulation for realistic signal behavior
- Phase calculation

### Usage Example

```typescript
import { SignalGenerator } from '$lib/services/signal-generator';

// Create generator with default parameters
const generator = new SignalGenerator(100, 1.0, 0.1);

// Add defect configurations
generator.setDefects([
  { position: 0.5, amplitude: 2.0, width: 0.01 },
  { position: 1.2, amplitude: 1.5, width: 0.015 }
]);

// Generate signal at specific time
const signal = generator.generateSignal(0.5);
console.log(signal); // { timestamp, amplitude, phase, position, frequency }

// Generate batch of signals
const batch = generator.generateBatch(0, 100, 0.01);
```

## Data Acquisition Service

**File:** `data-acquisition.ts`

Manages the data acquisition loop with:
- Configurable sampling rate (default 100 Hz)
- Start/stop/pause/resume controls
- Real-time data callbacks
- Defect injection support

### Usage Example

```typescript
import { DataAcquisitionService } from '$lib/services/data-acquisition';

// Create service with configuration
const daq = new DataAcquisitionService({
  samplingRate: 100,
  frequency: 100,
  amplitude: 1.0,
  noiseLevel: 0.1,
  defects: [
    { position: 0.5, amplitude: 2.0, width: 0.01 }
  ]
});

// Register callback for data
daq.onData((data) => {
  console.log('New signal data:', data);
  // Update UI, store data, etc.
});

// Start acquisition
daq.start();

// Pause acquisition
daq.pause();

// Resume acquisition
daq.resume();

// Stop acquisition
daq.stop();

// Update configuration while running
daq.updateConfig({
  samplingRate: 200,
  defects: [
    { position: 1.0, amplitude: 3.0, width: 0.02 }
  ]
});

// Get current status
const status = daq.getStatus();
console.log(status); // { isRunning, currentTime, samplingRate }
```

## Signal Processor Service

**File:** `signal-processor.ts`

Processes magnetic testing signals with:
- Gain adjustment (0-100 dB)
- Digital filtering (lowpass, highpass, bandpass)
- Phase calculation
- Defect detection using threshold comparison
- Gate-based signal analysis
- Processing pipeline for batch operations

### Usage Example

```typescript
import { SignalProcessor } from '$lib/services/signal-processor';

// Create processor
const processor = new SignalProcessor();

// Configure gain and filter
processor.setGain(60); // 60 dB gain
processor.setFilter('bandpass');

// Process single signal
const processedSignal = processor.processSignal(rawSignal);

// Process batch of signals
const processedBatch = processor.processBatch(rawSignals);

// Detect defects with gate configuration
const defects = processor.detectDefects(
  processedSignals,
  0.5, // threshold
  gateAConfig,
  gateBConfig
);

console.log(defects);
// [
//   {
//     id: 'defect-...',
//     position: 0.5,
//     amplitude: 2.3,
//     severity: 'high',
//     timestamp: Date,
//     gateTriggered: 'A'
//   }
// ]

// Create processing pipeline
const pipeline = processor.createPipeline(60, 'bandpass');
const processed = pipeline(rawSignals);

// Reset processor state
processor.reset();
```

## Supabase Client

**File:** `supabase.ts`

Provides the Supabase client singleton for database operations.

### Usage Example

```typescript
import { supabase } from '$lib/services/supabase';

// Use in your components or services
const { data, error } = await supabase
  .from('testing_sessions')
  .select('*')
  .eq('operator_id', userId);
```

## Integration Example

Here's how to integrate signal generation, processing, and data acquisition in a testing session:

```typescript
import { DataAcquisitionService, SignalProcessor } from '$lib/services';
import { supabase } from '$lib/services/supabase';

// Create session
const session = {
  projectName: 'Test Project',
  operatorId: userId,
  status: 'running',
  parameters: {
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
  }
};

const { data: sessionData } = await supabase
  .from('testing_sessions')
  .insert(session)
  .select()
  .single();

// Create signal processor
const processor = new SignalProcessor();
processor.setGain(session.parameters.gain);
processor.setFilter(session.parameters.filter);

// Start data acquisition
const daq = new DataAcquisitionService({
  samplingRate: 100,
  defects: [
    { position: 0.5, amplitude: 2.0, width: 0.01 }
  ]
});

const dataBuffer: SignalData[] = [];
const processedBuffer: SignalData[] = [];

daq.onData((rawData) => {
  // Process signal
  const processedData = processor.processSignal(rawData);
  
  // Add to buffers
  dataBuffer.push(rawData);
  processedBuffer.push(processedData);
  
  // Batch write every 100 samples
  if (dataBuffer.length >= 100) {
    // Detect defects in processed batch
    const defects = processor.detectDefects(
      processedBuffer,
      session.parameters.threshold,
      session.parameters.gateA,
      session.parameters.gateB
    );
    
    // Save signal data
    supabase
      .from('signal_data')
      .insert(
        processedBuffer.map(d => ({
          session_id: sessionData.id,
          timestamp: d.timestamp,
          amplitude: d.amplitude,
          phase: d.phase,
          position: d.position,
          frequency: d.frequency
        }))
      );
    
    // Save defects if any
    if (defects.length > 0) {
      supabase
        .from('defects')
        .insert(
          defects.map(d => ({
            session_id: sessionData.id,
            position: d.position,
            amplitude: d.amplitude,
            severity: d.severity,
            gate_triggered: d.gateTriggered,
            timestamp: d.timestamp
          }))
        );
    }
    
    // Clear buffers
    dataBuffer.length = 0;
    processedBuffer.length = 0;
  }
});

daq.start();

// Later, stop and finalize session
daq.stop();
await supabase
  .from('testing_sessions')
  .update({ status: 'completed', end_time: new Date() })
  .eq('id', sessionData.id);
```
