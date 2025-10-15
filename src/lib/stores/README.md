# Stores

This directory contains Svelte stores for state management in the magnetic testing instrument application.

## Overview

The application uses Svelte's built-in store system for reactive state management. Stores are organized by feature and provide a clean API for components to interact with application state.

## Available Stores

### Authentication Store (`auth.ts`)

Manages user authentication state and session information.

**Features:**
- User login/logout
- Session management
- User profile management
- Role-based access control

**Usage:**
```typescript
import { authStore, isAuthenticated, userRole } from '$lib/stores';

// In a Svelte component
$: user = $authStore.user;
$: authenticated = $isAuthenticated;
$: role = $userRole;

// Sign in
await authStore.signIn(email, password);

// Sign out
await authStore.signOut();
```

**Derived Stores:**
- `isAuthenticated`: Boolean indicating if user is logged in
- `userRole`: Current user's role (operator, engineer, admin)
- `isAdmin`: Boolean indicating if user is admin
- `isEngineerOrAdmin`: Boolean indicating if user is engineer or admin

### Testing Store (`testing.ts`)

Manages the current testing session state, signal data buffer, and defect detection.

**Features:**
- Start/pause/resume/stop testing sessions
- Real-time signal data buffering
- Automatic defect detection
- Progress tracking
- Batch data saving to database
- Historical session loading

**Usage:**
```typescript
import { testingStore, isTesting, testingStats } from '$lib/stores';

// In a Svelte component
$: session = $testingStore.currentSession;
$: isRunning = $isTesting;
$: stats = $testingStats;

// Start testing
await testingStore.startTesting('Project Name', parameters);

// Pause testing
testingStore.pauseTesting();

// Resume testing
testingStore.resumeTesting();

// Stop testing
await testingStore.stopTesting();

// Update parameters during testing
await testingStore.updateParameters({ gain: 60 });

// Load historical session
await testingStore.loadSession(sessionId);
```

**Derived Stores:**
- `isTesting`: Boolean indicating if testing is running
- `isPaused`: Boolean indicating if testing is paused
- `canStartTesting`: Boolean indicating if new test can be started
- `latestSignal`: Most recent signal data point
- `testingStats`: Formatted testing statistics (duration, samples, defects, rate)

## Store Architecture

### State Management Pattern

All stores follow a consistent pattern:

1. **State Interface**: TypeScript interface defining the store's state shape
2. **Initial State**: Default state values
3. **Store Creation**: Factory function creating the store with methods
4. **Actions**: Methods to modify state (async when needed)
5. **Derived Stores**: Computed values based on store state

### Example Store Structure

```typescript
interface MyState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: MyState = {
  data: null,
  loading: false,
  error: null
};

function createMyStore() {
  const { subscribe, set, update } = writable<MyState>(initialState);
  
  return {
    subscribe,
    
    async loadData() {
      update(state => ({ ...state, loading: true }));
      // ... load data
      update(state => ({ ...state, data, loading: false }));
    },
    
    clearError() {
      update(state => ({ ...state, error: null }));
    }
  };
}

export const myStore = createMyStore();
```

## Integration with Services

Stores act as the bridge between UI components and business logic services:

```
Components → Stores → Services → Database
    ↑                              ↓
    └──────── Reactive Updates ────┘
```

**Example:**
```typescript
// In testing store
async startTesting() {
  // 1. Create session in database (via Supabase service)
  const session = await supabase.from('testing_sessions').insert(...);
  
  // 2. Initialize services
  dataAcquisition = new DataAcquisitionService(...);
  signalProcessor = new SignalProcessor();
  
  // 3. Register callbacks
  dataAcquisition.onData((data) => {
    const processed = signalProcessor.processSignal(data);
    this.handleNewSignalData(processed);
  });
  
  // 4. Update store state
  update(state => ({ ...state, currentSession: session, status: 'running' }));
}
```

## Best Practices

### 1. Use Derived Stores for Computed Values

Instead of computing values in components, create derived stores:

```typescript
// Good
export const testingStats = derived(testingStore, $testing => ({
  duration: formatDuration($testing.progress.duration),
  samplingRate: calculateRate($testing.progress)
}));

// In component
$: stats = $testingStats;

// Avoid
$: stats = {
  duration: formatDuration($testingStore.progress.duration),
  samplingRate: calculateRate($testingStore.progress)
};
```

### 2. Handle Errors Gracefully

Always include error handling in store actions:

```typescript
async myAction() {
  try {
    update(state => ({ ...state, loading: true, error: null }));
    // ... perform action
    update(state => ({ ...state, loading: false }));
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    update(state => ({ ...state, loading: false, error: errorMessage }));
    return { success: false, error: errorMessage };
  }
}
```

### 3. Clean Up Resources

Always clean up timers, intervals, and service instances:

```typescript
function createMyStore() {
  let interval: ReturnType<typeof setInterval> | null = null;
  
  return {
    subscribe,
    
    start() {
      interval = setInterval(() => { /* ... */ }, 1000);
    },
    
    stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  };
}
```

### 4. Use TypeScript for Type Safety

Always define interfaces for store state and return types:

```typescript
interface MyState {
  data: MyData | null;
  loading: boolean;
  error: string | null;
}

async myAction(): Promise<{ success: boolean; error?: string }> {
  // ...
}
```

## Testing Stores

Stores can be tested by subscribing to them and checking state changes:

```typescript
import { get } from 'svelte/store';
import { testingStore } from './testing';

// Get current state
const state = get(testingStore);

// Subscribe to changes
const unsubscribe = testingStore.subscribe(state => {
  console.log('State changed:', state);
});

// Perform action
await testingStore.startTesting('Test');

// Clean up
unsubscribe();
```

## Performance Considerations

### 1. Batch Updates

When updating multiple properties, use a single `update` call:

```typescript
// Good
update(state => ({
  ...state,
  prop1: value1,
  prop2: value2,
  prop3: value3
}));

// Avoid
update(state => ({ ...state, prop1: value1 }));
update(state => ({ ...state, prop2: value2 }));
update(state => ({ ...state, prop3: value3 }));
```

### 2. Limit Buffer Sizes

For real-time data, limit buffer sizes to prevent memory issues:

```typescript
update(state => {
  const newBuffer = [...state.buffer, newData];
  // Keep only last 1000 samples
  if (newBuffer.length > 1000) {
    newBuffer.shift();
  }
  return { ...state, buffer: newBuffer };
});
```

### 3. Debounce Frequent Updates

For high-frequency updates, consider debouncing:

```typescript
let updateTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedUpdate(data: any) {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    update(state => ({ ...state, data }));
  }, 100);
}
```

## Examples

See the `__tests__` directory for comprehensive usage examples:
- `testing.example.ts`: Complete testing store examples

