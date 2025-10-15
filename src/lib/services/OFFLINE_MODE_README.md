# Offline Mode Implementation

This document describes the offline mode implementation using IndexedDB for the Magnetic Testing Instrument application.

## Overview

The offline mode allows the application to continue functioning when network connectivity is unavailable. Data is stored locally in IndexedDB and automatically synchronized when the network connection is restored.

## Architecture

### Components

1. **offline-db.ts** - Dexie.js database schema and configuration
2. **offline-storage.ts** - Service for storing and retrieving offline data
3. **network-status.ts** - Network connectivity detection and monitoring
4. **OfflineIndicator.svelte** - UI component showing offline status

## Database Schema

### Tables

#### sessions
Stores testing session metadata
- `id` (string, primary key)
- `startTime` (number)
- `status` (string)
- `syncStatus` ('pending' | 'synced' | 'error')
- `operator` (string)

#### signalData
Stores signal measurement data points
- `id` (auto-increment, primary key)
- `sessionId` (string, foreign key)
- `timestamp` (number)
- `position` (number)
- `amplitude` (number)
- `phase` (number)

#### defects
Stores detected defects
- `id` (string, primary key)
- `sessionId` (string, foreign key)
- `position` (number)
- `severity` (string)
- `timestamp` (number)

#### calibrations
Stores calibration data
- `id` (string, primary key)
- `calibrationDate` (number)
- `isActive` (boolean)

#### pendingSync
Queue of items waiting to be synchronized
- `id` (auto-increment, primary key)
- `type` ('session' | 'signal_data' | 'defect' | 'calibration')
- `action` ('create' | 'update' | 'delete')
- `data` (any)
- `timestamp` (number)
- `retryCount` (number)
- `sessionId` (string, optional)

## Usage

### Basic Operations

#### Save a Session
```typescript
import { offlineStorage } from '$lib/services';

const session: TestingSession = {
  id: 'session-123',
  projectName: 'Test Project',
  operator: 'user-id',
  startTime: Date.now(),
  status: 'running',
  parameters: { /* ... */ }
};

await offlineStorage.saveSession(session);
```

#### Save Signal Data
```typescript
const signalData: SignalData[] = [
  {
    timestamp: Date.now(),
    amplitude: 1.5,
    phase: 0.5,
    position: 10.0,
    frequency: 100
  }
];

await offlineStorage.saveSignalData('session-123', signalData);
```

#### Get Pending Sync Items
```typescript
const pendingItems = await offlineStorage.getPendingSyncItems();
console.log(`${pendingItems.length} items waiting to sync`);
```

### Network Status Monitoring

#### Using Svelte Stores
```svelte
<script>
  import { networkStatus, isOffline } from '$lib/services';
</script>

{#if $isOffline}
  <div class="alert alert-warning">
    You are currently offline. Data will be saved locally.
  </div>
{/if}

<div>
  Connection Type: {$networkStatus.effectiveType}
  RTT: {$networkStatus.rtt}ms
</div>
```

#### Programmatic Checks
```typescript
import { networkManager, checkNetworkConnectivity } from '$lib/services';

// Check browser online status
if (networkManager.isOnline()) {
  console.log('Browser reports online');
}

// Test actual connectivity
const isConnected = await checkNetworkConnectivity();
if (isConnected) {
  console.log('Server is reachable');
}
```

### Storage Management

#### Get Storage Statistics
```typescript
const stats = await offlineStorage.getStorageStats();
console.log(`Sessions: ${stats.sessionsCount}`);
console.log(`Signal Data Points: ${stats.signalDataCount}`);
console.log(`Pending Sync: ${stats.pendingSyncCount}`);
console.log(`Storage: ${stats.storageUsage} / ${stats.storageQuota} bytes`);
```

#### Clear Old Data
```typescript
// Clear synced data older than 7 days
await offlineStorage.clearSyncedData(7);
```

## UI Components

### OfflineIndicator

Add to your layout to show offline status:

```svelte
<script>
  import OfflineIndicator from '$lib/components/common/OfflineIndicator.svelte';
</script>

<OfflineIndicator />
```

Features:
- Shows warning when offline
- Displays pending sync count
- Shows storage statistics
- Indicates when syncing is in progress

## Data Synchronization Flow

1. **Offline Operation**
   - User performs action (create session, save data, etc.)
   - Data is saved to IndexedDB
   - Item is added to `pendingSync` queue
   - UI shows offline indicator

2. **Network Recovery**
   - Network status changes to online
   - Sync service processes `pendingSync` queue
   - Items are uploaded to Supabase in order
   - Successful items are removed from queue
   - Failed items increment retry count

3. **Sync Completion**
   - Session marked as 'synced'
   - UI shows sync success
   - Old synced data can be cleaned up

## Best Practices

### 1. Always Check Network Status
```typescript
if (networkManager.isOnline()) {
  // Try online operation first
  await supabaseService.saveSession(session);
} else {
  // Fall back to offline storage
  await offlineStorage.saveSession(session);
}
```

### 2. Handle Sync Errors Gracefully
```typescript
try {
  await syncToServer(item);
  await offlineStorage.removeSyncItem(item.id);
} catch (error) {
  await offlineStorage.updateSyncItemRetry(item.id);
  if (item.retryCount > 3) {
    await offlineStorage.markSessionSyncError(
      item.sessionId,
      'Max retries exceeded'
    );
  }
}
```

### 3. Monitor Storage Usage
```typescript
const stats = await offlineStorage.getStorageStats();
const usagePercent = (stats.storageUsage / stats.storageQuota) * 100;

if (usagePercent > 80) {
  // Warn user about low storage
  // Suggest clearing old data
  await offlineStorage.clearSyncedData(3); // Clear data older than 3 days
}
```

### 4. Batch Operations
```typescript
// Good: Batch signal data saves
const batchSize = 100;
for (let i = 0; i < signalData.length; i += batchSize) {
  const batch = signalData.slice(i, i + batchSize);
  await offlineStorage.saveSignalData(sessionId, batch);
}

// Avoid: Saving one at a time
// for (const data of signalData) {
//   await offlineStorage.saveSignalData(sessionId, [data]);
// }
```

## Performance Considerations

### IndexedDB Performance
- **Batch writes**: Use `bulkAdd()` for multiple records
- **Indexes**: Queries on `sessionId` and `timestamp` are optimized
- **Transactions**: Dexie automatically manages transactions

### Storage Limits
- **Desktop browsers**: Typically 50% of available disk space
- **Mobile browsers**: Varies by device, typically 10-50 MB
- **Check quota**: Use `getStorageEstimate()` to monitor

### Memory Management
- Don't load all signal data at once
- Use pagination for large datasets
- Clear synced data periodically

## Testing

### Manual Testing

1. **Test Offline Mode**
   - Open DevTools → Network tab
   - Set to "Offline"
   - Perform operations
   - Verify data saved to IndexedDB

2. **Test Sync**
   - Go back online
   - Verify pending items sync
   - Check Supabase for synced data

3. **Test Storage Limits**
   - Generate large amounts of data
   - Monitor storage usage
   - Verify cleanup works

### Automated Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { offlineStorage } from './offline-storage';

describe('OfflineStorage', () => {
  beforeEach(async () => {
    await db.clearAll();
  });

  it('should save and retrieve session', async () => {
    const session = { /* ... */ };
    await offlineStorage.saveSession(session);
    
    const retrieved = await offlineStorage.getSession(session.id);
    expect(retrieved).toEqual(expect.objectContaining(session));
  });

  it('should add items to sync queue', async () => {
    const session = { /* ... */ };
    await offlineStorage.saveSession(session);
    
    const pending = await offlineStorage.getPendingSyncItems();
    expect(pending.length).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### Issue: Data not syncing
**Solution**: Check pending sync items and retry counts
```typescript
const pending = await offlineStorage.getPendingSyncItems();
console.log('Pending items:', pending);
```

### Issue: Storage quota exceeded
**Solution**: Clear old synced data
```typescript
await offlineStorage.clearSyncedData(1); // Clear data older than 1 day
```

### Issue: IndexedDB not available
**Solution**: Check browser support and privacy settings
```typescript
if (!('indexedDB' in window)) {
  console.error('IndexedDB not supported');
  // Fall back to localStorage or show error
}
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 10+)
- Opera: Full support

## Security Considerations

1. **Data Encryption**: IndexedDB data is not encrypted by default
   - Consider encrypting sensitive data before storage
   - Use Web Crypto API for encryption

2. **Storage Persistence**: Request persistent storage
   ```typescript
   if (navigator.storage && navigator.storage.persist) {
     const isPersisted = await navigator.storage.persist();
     console.log(`Storage persisted: ${isPersisted}`);
   }
   ```

3. **Clear on Logout**: Clear offline data when user logs out
   ```typescript
   await db.clearAll();
   ```

## Future Enhancements

- [ ] Implement conflict resolution for concurrent edits
- [ ] Add data compression for large datasets
- [ ] Implement selective sync (sync only specific sessions)
- [ ] Add background sync using Service Worker
- [ ] Implement data encryption for sensitive information
- [ ] Add export/import functionality for offline data
