# Task 19: 校准功能实现 - Implementation Summary

## Overview

Successfully implemented the calibration functionality for the magnetic testing instrument, including a comprehensive 4-step wizard that guides users through the calibration process using a standard test block.

## Completed Sub-tasks

### ✅ 19.1 创建 CalibrationWizard 组件，引导用户完成校准
- Created `src/lib/components/settings/CalibrationWizard.svelte`
- Implemented 4-step wizard with visual step indicator
- Added smooth transitions between steps
- Integrated with auth store for operator information

### ✅ 19.2 实现步骤 1：提示放置标准试块
- Form inputs for standard block ID (required)
- Auto-filled operator name from auth store
- Optional notes field
- Validation before proceeding to next step

### ✅ 19.3 实现步骤 2：采集参考信号
- Simulated signal capture process (2 seconds)
- Generated 1000-point reference signal with realistic characteristics
- Displayed signal statistics (average amplitude, max amplitude)
- Progress indicator during capture

### ✅ 19.4 实现步骤 3：计算校准系数
- Calculated gain correction coefficient
- Calculated phase correction coefficient
- Calculated offset correction coefficient
- Added temperature coefficient support
- Displayed all coefficients with proper formatting

### ✅ 19.5 实现校准偏差检查和重新校准提示
- Calculated deviation from expected values
- Set maximum allowed deviation threshold (5%)
- Failed calibration if deviation exceeds threshold
- Provided clear error messages and recalibration option
- Color-coded deviation display (green for good, red for bad)

### ✅ 19.6 保存校准数据到数据库，记录时间和操作员
- Integrated with Supabase service
- Saved complete calibration data including:
  - Operator ID from auth store
  - Calibration type ('standard_block')
  - Reference signal data and statistics
  - Calculated coefficients
  - Standard block ID
  - Calibration date and expiry date (1 year)
  - Active status
  - Optional notes
- Success notification after save
- Error handling for save failures

## Files Created/Modified

### Created Files
1. `src/lib/components/settings/CalibrationWizard.svelte` - Main calibration wizard component
2. `src/lib/components/settings/CALIBRATION_README.md` - Component documentation

### Modified Files
1. `src/routes/calibration/+page.svelte` - Updated to use CalibrationWizard component and display recent calibrations

## Key Features

### 1. Step-by-Step Wizard
- Visual step indicator showing progress
- Clear instructions for each step
- Back/Next navigation
- Validation at each step

### 2. Signal Capture Simulation
- Realistic signal generation with noise
- 1000 data points captured
- Signal statistics displayed
- Progress indicator during capture

### 3. Coefficient Calculation
- **Gain Correction**: Normalizes signal amplitude
- **Phase Correction**: Corrects phase shift
- **Offset Correction**: Removes DC component
- **Temperature Coefficient**: Optional temperature compensation

### 4. Deviation Checking
- Calculates deviation from expected values
- 5% maximum allowed deviation
- Fails calibration if threshold exceeded
- Clear visual feedback (color-coded)

### 5. Database Integration
- Saves to Supabase `calibrations` table
- Records operator information
- Sets expiry date (1 year)
- Marks as active calibration

### 6. Recent Calibrations Display
- Shows last 5 calibrations
- Displays calibration details
- Active/Inactive status badges
- Expandable history view

## Technical Implementation

### Data Flow
```
User Input → Validation → Signal Capture → Coefficient Calculation → 
Deviation Check → Save to Database → Success Notification
```

### Calibration Coefficients
```typescript
interface CalibrationCoefficients {
  gainCorrection: number;      // expectedAmplitude / actualAmplitude
  phaseCorrection: number;      // -phaseShift (in radians)
  offsetCorrection: number;     // -dcOffset
  temperatureCoefficient?: number; // Optional temp compensation
}
```

### Database Schema
```sql
calibrations table:
- id (UUID)
- operator_id (UUID, references profiles)
- calibration_type (TEXT)
- reference_signal (JSONB)
- coefficients (JSONB)
- standard_block (TEXT)
- calibration_date (TIMESTAMPTZ)
- expiry_date (TIMESTAMPTZ)
- is_active (BOOLEAN)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```

## User Experience

### Step 1: Prepare
1. User enters standard block ID
2. Operator name auto-filled from login
3. Optional notes can be added
4. Click "Start Calibration" to proceed

### Step 2: Capture
1. Instructions to keep block stable
2. Click "Capture Signal" button
3. 2-second capture with loading indicator
4. Signal statistics displayed
5. Click "Next" to proceed

### Step 3: Calculate
1. Click "Start Calculation" button
2. 1.5-second calculation with loading indicator
3. All coefficients displayed
4. Deviation shown with color coding
5. If deviation > 5%, calibration fails
6. Click "Next" if successful

### Step 4: Complete
1. Summary of all calibration data
2. Review coefficients and deviation
3. Option to recalibrate or save
4. Click "Save Calibration" to persist
5. Success notification shown
6. Wizard resets for next calibration

## Error Handling

1. **Missing Required Fields**: Alert before starting
2. **Signal Capture Failure**: Error message with retry option
3. **Calculation Failure**: Error message with restart option
4. **Excessive Deviation**: Fail status with recalibration prompt
5. **Database Save Failure**: Error message with details
6. **User Not Logged In**: Error message prompting login

## Styling

- Industrial orange and black color scheme
- Step indicator with active/completed states
- Responsive design (desktop, tablet, mobile)
- Loading spinners for async operations
- Color-coded status indicators
- Smooth transitions between steps

## Requirements Satisfied

✅ **需求 8.1**: 用户进入校准页面 THEN 系统应显示校准向导界面
✅ **需求 8.2**: 校准开始 THEN 系统应引导用户放置标准试块
✅ **需求 8.3**: 用户确认试块就位 THEN 系统应采集参考信号
✅ **需求 8.4**: 参考信号采集完成 THEN 系统应计算校准系数并显示结果
✅ **需求 8.5**: 校准偏差超过允许范围 THEN 系统应提示重新校准
✅ **需求 8.6**: 校准成功 THEN 系统应保存校准数据到数据库并记录校准时间和操作员信息

## Testing Recommendations

### Manual Testing
1. Complete full calibration workflow
2. Test with missing required fields
3. Test deviation threshold (modify signal to exceed 5%)
4. Test save to database
5. Verify recent calibrations display
6. Test responsive design on different screen sizes

### Integration Testing
- Test Supabase integration
- Test auth store integration
- Test calibration data retrieval

### Edge Cases
- User not logged in
- Network failure during save
- Invalid signal data
- Expired calibrations

## Future Enhancements

1. **Real Hardware Integration**: Replace simulated signal with actual hardware capture
2. **Multiple Calibration Types**: Support reference signal, system check, custom types
3. **Signal Visualization**: Add chart to visualize captured signal
4. **Calibration Comparison**: Compare current vs previous calibrations
5. **Export Certificates**: Generate PDF calibration certificates
6. **Automatic Expiry Alerts**: Notify when calibration is about to expire
7. **Multi-point Calibration**: Support calibration at multiple reference points
8. **Temperature Compensation**: Advanced temperature-based corrections

## Notes

- Signal capture is currently simulated; production version needs hardware integration
- Calibration coefficients use simplified algorithms; may need refinement for production
- Expiry date is set to 1 year by default; should be configurable based on standards
- Only 'standard_block' calibration type is implemented; others can be added later

## Conclusion

Task 19 has been successfully completed with all sub-tasks implemented. The calibration wizard provides a professional, user-friendly interface for instrument calibration with proper validation, error handling, and database integration. The implementation satisfies all requirements (需求 8.1-8.6) and provides a solid foundation for future enhancements.
