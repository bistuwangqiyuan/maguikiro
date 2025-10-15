# Calibration Wizard Component

## Overview

The CalibrationWizard component provides a step-by-step guided process for calibrating the magnetic testing instrument using a standard test block. It implements the calibration workflow defined in the requirements (需求 8).

## Features

- **4-Step Wizard Process**:
  1. Prepare standard test block and enter information
  2. Capture reference signal from the test block
  3. Calculate calibration coefficients
  4. Review and save calibration results

- **Automatic Calculations**:
  - Gain correction coefficient
  - Phase correction coefficient
  - Offset correction coefficient
  - Temperature coefficient (optional)

- **Validation**:
  - Checks calibration deviation against maximum allowed threshold (5%)
  - Prompts for recalibration if deviation is too large
  - Validates required fields before proceeding

- **Database Integration**:
  - Saves calibration data to Supabase
  - Records operator information and timestamp
  - Sets expiry date (1 year by default)
  - Marks calibration as active

## Usage

### Basic Usage

```svelte
<script>
  import CalibrationWizard from '$lib/components/settings/CalibrationWizard.svelte';
  
  function handleComplete(calibrationId) {
    console.log('Calibration saved with ID:', calibrationId);
    // Reload calibration list or navigate
  }
  
  function handleCancel() {
    console.log('Calibration cancelled');
    // Navigate back or close modal
  }
</script>

<CalibrationWizard 
  onComplete={handleComplete}
  onCancel={handleCancel}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onComplete` | `(calibrationId: string) => void` | No | Callback when calibration is successfully saved |
| `onCancel` | `() => void` | No | Callback when user cancels calibration |

## Calibration Process

### Step 1: Prepare

User enters:
- Standard block ID (required)
- Operator name (auto-filled from auth store)
- Notes (optional)

### Step 2: Capture

- System captures reference signal from standard block
- Simulates 2-second capture process
- Generates 1000 data points with known characteristics
- Displays signal statistics (average amplitude, max amplitude)

### Step 3: Calculate

- Calculates calibration coefficients based on reference signal
- Computes:
  - Gain correction: `expectedAmplitude / actualAmplitude`
  - Phase correction: Corrects phase shift from expected
  - Offset correction: Removes DC component
- Checks deviation against threshold (5%)
- Fails if deviation is too large

### Step 4: Complete

- Displays summary of calibration results
- Shows all coefficients and deviation
- Allows user to save or recalibrate
- Saves to database with:
  - Operator ID
  - Calibration type: 'standard_block'
  - Reference signal data
  - Calculated coefficients
  - Standard block ID
  - Calibration date
  - Expiry date (1 year)
  - Active status

## Data Structure

### CalibrationData

```typescript
interface CalibrationData {
  id: string;
  operatorId: string;
  calibrationType: string;
  referenceSignal: {
    data: number[];
    length: number;
    avgAmplitude: number;
    maxAmplitude: number;
  };
  coefficients: CalibrationCoefficients;
  standardBlock?: string;
  calibrationDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
}
```

### CalibrationCoefficients

```typescript
interface CalibrationCoefficients {
  gainCorrection: number;
  phaseCorrection: number;
  offsetCorrection: number;
  temperatureCoefficient?: number;
}
```

## Styling

The component uses CSS custom properties for theming:

- `--primary-orange`: Primary action color
- `--primary-orange-dark`: Hover state for primary actions
- `--bg-dark`: Dark background
- `--bg-medium`: Medium background
- `--bg-light`: Light background/borders
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--success`: Success state color
- `--error`: Error state color

## Error Handling

The component handles several error scenarios:

1. **Missing Required Fields**: Shows error message if standard block or operator is not filled
2. **Signal Capture Failure**: Displays error and allows retry
3. **Calculation Failure**: Shows error message and allows restart
4. **Excessive Deviation**: Fails calibration and prompts for recalibration
5. **Database Save Failure**: Shows error message with details

## Responsive Design

- Desktop: Full wizard layout with horizontal step indicator
- Tablet: Adjusted spacing and button sizes
- Mobile: Vertical step indicator, stacked buttons, full-width inputs

## Integration with Supabase

The component uses `supabaseService.saveCalibration()` to persist data:

```typescript
const calibrationData = {
  operatorId: userId,
  calibrationType: 'standard_block',
  referenceSignal: { /* signal data */ },
  coefficients: { /* calculated coefficients */ },
  standardBlock: 'STD-001',
  calibrationDate: new Date(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  isActive: true,
  notes: 'Optional notes'
};

const calibrationId = await supabaseService.saveCalibration(calibrationData);
```

## Future Enhancements

- Support for different calibration types (reference signal, system check, custom)
- Real hardware integration for signal capture
- Advanced signal analysis and visualization
- Calibration history comparison
- Export calibration certificates
- Multi-point calibration
- Temperature compensation
- Automatic expiry notifications

## Requirements Mapping

This component satisfies the following requirements:

- **需求 8.1**: Calibration wizard interface ✓
- **需求 8.2**: Prompt for standard test block placement ✓
- **需求 8.3**: Capture reference signal ✓
- **需求 8.4**: Calculate calibration coefficients ✓
- **需求 8.5**: Check deviation and prompt for recalibration ✓
- **需求 8.6**: Save calibration data with timestamp and operator ✓
