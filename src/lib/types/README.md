# Type Definitions

This directory contains all TypeScript type definitions for the Magnetic Testing Instrument application.

## File Structure

### Core Types

- **`signal.ts`** - Signal data, gate configuration, testing parameters, and defect types
- **`session.ts`** - Testing session types and filters
- **`database.ts`** - Database table types and raw database types (snake_case)
- **`enums.ts`** - All enumeration types used throughout the application
- **`utility.ts`** - Utility types for common patterns (pagination, API responses, etc.)
- **`index.ts`** - Central export point for all types

## Usage

### Importing Types

```typescript
// Import specific types
import type { SignalData, TestingSession, GateConfig } from '$lib/types';

// Import enums
import { TestingStatusEnum, DefectSeverityEnum } from '$lib/types';

// Import utility types
import type { PaginatedResult, ApiResponse } from '$lib/types';
```

### Type Categories

#### 1. Signal Types (`signal.ts`)

Types related to signal data and processing:

- `SignalData` - Individual signal measurement point
- `GateConfig` - Gate configuration for signal analysis
- `TestingParameters` - Complete testing parameter set
- `Defect` - Detected defect information
- `FilterType` - Signal filter types

#### 2. Session Types (`session.ts`)

Types for testing sessions:

- `TestingSession` - Complete session metadata
- `CompleteSessionData` - Session with signal data and defects
- `SessionFilters` - Query filters for sessions
- `TestingStatus` - Session status type

#### 3. Database Types (`database.ts`)

Database-related types:

- **Application Types** (camelCase) - Used in application code
  - `Profile`, `CalibrationData`, `Report`, etc.

- **Raw Database Types** (snake_case) - Used for Supabase queries
  - `DbProfile`, `DbTestingSession`, `DbSignalData`, etc.

#### 4. Enums (`enums.ts`)

All enumeration types:

- `UserRole` - User role levels
- `TestingStatus` - Testing session states
- `DefectSeverity` - Defect severity levels
- `FilterType` - Signal filter types
- `ExportFormat` - Data export formats
- And more...

#### 5. Utility Types (`utility.ts`)

Helper types for common patterns:

- `PaginatedResult<T>` - Paginated data structure
- `ApiResponse<T>` - Standard API response wrapper
- `DataState<T>` - Data with loading state
- `ValidationResult` - Validation results
- `OperationResult<T>` - Operation success/failure
- And more...

## Type Naming Conventions

### Application Types (camelCase)

Used in application code:

```typescript
interface TestingSession {
  projectName: string;
  operatorId: string;
  startTime: Date;
}
```

### Database Types (snake_case)

Used for direct Supabase interactions:

```typescript
interface DbTestingSession {
  project_name: string;
  operator_id: string;
  start_time: string;
}
```

### Type vs Enum

- **Type unions** - For simple string literals:
  ```typescript
  type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'none';
  ```

- **Enums** - For values used in logic and comparisons:
  ```typescript
  enum TestingStatus {
    RUNNING = 'running',
    PAUSED = 'paused',
    COMPLETED = 'completed'
  }
  ```

## Database Schema Mapping

The types in `database.ts` correspond to the Supabase database schema:

| Database Table | Application Type | Raw DB Type |
|----------------|------------------|-------------|
| `profiles` | `Profile` | `DbProfile` |
| `testing_sessions` | `TestingSession` | `DbTestingSession` |
| `signal_data` | `SignalData` | `DbSignalData` |
| `defects` | `Defect` | `DbDefect` |
| `calibrations` | `CalibrationData` | `DbCalibration` |
| `reports` | `Report` | `DbReport` |

## Type Conversion

When working with Supabase, convert between raw and application types:

```typescript
// Raw DB type to Application type
function dbToApp(dbSession: DbTestingSession): TestingSession {
  return {
    id: dbSession.id,
    projectName: dbSession.project_name,
    operatorId: dbSession.operator_id,
    startTime: new Date(dbSession.start_time),
    endTime: dbSession.end_time ? new Date(dbSession.end_time) : undefined,
    status: dbSession.status,
    parameters: dbSession.parameters as TestingParameters,
    metadata: dbSession.metadata,
    createdAt: new Date(dbSession.created_at),
    updatedAt: new Date(dbSession.updated_at)
  };
}

// Application type to Raw DB type
function appToDb(session: Partial<TestingSession>): Partial<DbTestingSession> {
  return {
    project_name: session.projectName,
    operator_id: session.operatorId,
    start_time: session.startTime?.toISOString(),
    end_time: session.endTime?.toISOString(),
    status: session.status,
    parameters: session.parameters as unknown as Record<string, unknown>,
    metadata: session.metadata
  };
}
```

## Requirements Coverage

This type system satisfies the following requirements:

- **Requirement 2.1** - Signal data types for real-time waveform display
- **Requirement 3.1** - Testing parameter configuration types
- **Requirement 7.1** - Gate configuration types
- **Requirement 4.1-4.4** - Database table types
- **Requirement 11.1-11.2** - User authentication and role types

## Best Practices

1. **Always use types from the central export**:
   ```typescript
   import type { SignalData } from '$lib/types';
   ```

2. **Use enums for values in logic**:
   ```typescript
   if (status === TestingStatusEnum.RUNNING) { ... }
   ```

3. **Use utility types for common patterns**:
   ```typescript
   const result: OperationResult<TestingSession> = await createSession();
   ```

4. **Prefer type unions over enums for simple cases**:
   ```typescript
   type FilterType = 'lowpass' | 'highpass' | 'bandpass';
   ```

5. **Document complex types with JSDoc comments**:
   ```typescript
   /**
    * Complete testing session with all related data
    */
   export interface CompleteSessionData extends TestingSession {
     signalData: SignalData[];
     defects: Defect[];
   }
   ```

## Type Safety

All types are designed to provide maximum type safety:

- Required vs optional fields are clearly marked
- Date types are used for timestamps (converted from ISO strings)
- Enums prevent invalid values
- Generic types provide flexibility while maintaining type safety
- Utility types reduce boilerplate and ensure consistency

## Future Extensions

When adding new types:

1. Add the type definition to the appropriate file
2. Export it from `index.ts`
3. Update this README with documentation
4. Add JSDoc comments for complex types
5. Consider adding corresponding enums if needed
