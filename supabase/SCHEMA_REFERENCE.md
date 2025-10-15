# Database Schema Quick Reference

## Tables Overview

### 1. profiles
Extends Supabase Auth users with application-specific profile data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| username | TEXT | Unique username |
| full_name | TEXT | User's full name |
| role | TEXT | User role: 'operator', 'engineer', 'admin' |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes**: `idx_profiles_role`

**RLS**: Users can view/update own profile; admins can view/update all

---

### 2. testing_sessions
Main table for magnetic testing sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_name | TEXT | Name of the testing project |
| operator_id | UUID | References profiles(id) |
| start_time | TIMESTAMPTZ | Session start time |
| end_time | TIMESTAMPTZ | Session end time (null if ongoing) |
| status | TEXT | 'running', 'paused', 'completed', 'error' |
| parameters | JSONB | Testing parameters (gain, filter, gates, etc.) |
| metadata | JSONB | Additional session metadata |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes**: 
- `idx_sessions_operator`
- `idx_sessions_status`
- `idx_sessions_start_time`
- `idx_sessions_project_name`

**RLS**: Users can view/manage own sessions; engineers/admins can view all

**Parameters JSON Structure**:
```json
{
  "gain": 60,
  "filter": "bandpass",
  "velocity": 100,
  "threshold": 0.5,
  "gateA": {
    "enabled": true,
    "start": 0,
    "width": 100,
    "height": 50,
    "alarmThreshold": 0.8,
    "color": "#FFD700"
  },
  "gateB": {
    "enabled": true,
    "start": 100,
    "width": 100,
    "height": 50,
    "alarmThreshold": 0.8,
    "color": "#FF69B4"
  }
}
```

---

### 3. signal_data
High-volume table storing raw signal measurements.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key (auto-increment) |
| session_id | UUID | References testing_sessions(id) CASCADE |
| timestamp | BIGINT | Measurement timestamp (milliseconds) |
| amplitude | REAL | Signal amplitude |
| phase | REAL | Signal phase |
| position | REAL | Position along test piece |
| frequency | REAL | Signal frequency |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Indexes**: 
- `idx_signal_session`
- `idx_signal_timestamp`
- `idx_signal_position`

**RLS**: Users can view/insert data for own sessions; engineers/admins can view all

**Performance Notes**: 
- Uses BIGSERIAL for efficient auto-increment
- Optimized for batch inserts
- Consider partitioning for very large datasets

---

### 4. defects
Detected defects and anomalies during testing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | References testing_sessions(id) CASCADE |
| position | REAL | Defect position |
| amplitude | REAL | Defect signal amplitude |
| severity | TEXT | 'low', 'medium', 'high', 'critical' |
| gate_triggered | TEXT | 'A', 'B', 'both' |
| timestamp | TIMESTAMPTZ | Detection timestamp |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Indexes**: 
- `idx_defects_session`
- `idx_defects_severity`
- `idx_defects_timestamp`

**RLS**: Users can view/manage defects for own sessions; engineers/admins can view all

---

### 5. calibrations
System calibration records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| operator_id | UUID | References profiles(id) |
| calibration_type | TEXT | Type of calibration |
| reference_signal | JSONB | Reference signal data |
| coefficients | JSONB | Calculated calibration coefficients |
| standard_block | TEXT | Standard test block used |
| calibration_date | TIMESTAMPTZ | Calibration date |
| expiry_date | TIMESTAMPTZ | Calibration expiry date |
| is_active | BOOLEAN | Whether calibration is active |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Indexes**: 
- `idx_calibrations_active`
- `idx_calibrations_operator`
- `idx_calibrations_type`

**RLS**: All users can view active calibrations; engineers/admins can create/update

**Coefficients JSON Structure**:
```json
{
  "gain_correction": 1.05,
  "phase_offset": 0.02,
  "amplitude_scale": 1.0
}
```

---

### 6. reports
Generated test reports metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | References testing_sessions(id) CASCADE |
| report_type | TEXT | Type of report |
| standard | TEXT | Standard used (ASME, ISO, EN, ASTM) |
| content | JSONB | Report content and findings |
| pdf_url | TEXT | URL to PDF in storage |
| generated_by | UUID | References profiles(id) |
| generated_at | TIMESTAMPTZ | Report generation timestamp |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Indexes**: 
- `idx_reports_session`
- `idx_reports_generated_by`
- `idx_reports_generated_at`
- `idx_reports_standard`

**RLS**: Users can view/create reports for own sessions; engineers/admins can view all

---

## Storage Buckets

### report-pdfs
Stores generated PDF reports.

**Configuration**:
- Public: false (requires authentication)
- File size limit: 50 MB
- Allowed MIME types: application/pdf

**Path Structure**: `{report_id}/report.pdf`

**RLS Policies**:
- Users can upload/view/update/delete PDFs for own reports
- Engineers/admins can access all PDFs

---

## Helper Functions

### get_active_calibration(cal_type TEXT)
Returns the current active calibration for a given type.

**Returns**: Table with id, calibration_type, coefficients, calibration_date

**Usage**:
```sql
SELECT * FROM get_active_calibration('standard');
```

---

### is_calibration_expired(calibration_id UUID)
Checks if a calibration has expired.

**Returns**: BOOLEAN

**Usage**:
```sql
SELECT is_calibration_expired('uuid-here');
```

---

### get_report_pdf_path(report_id UUID)
Generates the storage path for a report PDF.

**Returns**: TEXT

**Usage**:
```sql
SELECT get_report_pdf_path('uuid-here');
```

---

### get_report_pdf_url(report_id UUID, expires_in INTEGER)
Gets the storage URL path for a report PDF.

**Returns**: TEXT

**Usage**:
```sql
SELECT get_report_pdf_url('uuid-here', 3600);
```

---

## Common Queries

### Get user's recent sessions
```sql
SELECT * FROM testing_sessions
WHERE operator_id = auth.uid()
ORDER BY start_time DESC
LIMIT 10;
```

### Get session with signal data count
```sql
SELECT 
  ts.*,
  COUNT(sd.id) as signal_count
FROM testing_sessions ts
LEFT JOIN signal_data sd ON ts.id = sd.session_id
WHERE ts.operator_id = auth.uid()
GROUP BY ts.id
ORDER BY ts.start_time DESC;
```

### Get defects by severity
```sql
SELECT 
  severity,
  COUNT(*) as count
FROM defects
WHERE session_id = 'session-uuid-here'
GROUP BY severity
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

### Get active calibration
```sql
SELECT * FROM calibrations
WHERE is_active = true
  AND (expiry_date IS NULL OR expiry_date > NOW())
ORDER BY calibration_date DESC
LIMIT 1;
```

### Get session with all related data
```sql
SELECT 
  ts.*,
  json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL) as defects,
  COUNT(DISTINCT sd.id) as signal_count,
  json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL) as reports
FROM testing_sessions ts
LEFT JOIN defects d ON ts.id = d.session_id
LEFT JOIN signal_data sd ON ts.id = sd.session_id
LEFT JOIN reports r ON ts.id = r.session_id
WHERE ts.id = 'session-uuid-here'
GROUP BY ts.id;
```

---

## Relationships

```
auth.users (Supabase Auth)
    ↓
profiles
    ↓
    ├── testing_sessions (operator_id)
    │       ↓
    │       ├── signal_data (session_id) [CASCADE DELETE]
    │       ├── defects (session_id) [CASCADE DELETE]
    │       └── reports (session_id) [CASCADE DELETE]
    │
    ├── calibrations (operator_id)
    └── reports (generated_by)
```

---

## Access Control Matrix

| Table | Operator | Engineer | Admin |
|-------|----------|----------|-------|
| profiles | Own: R/W | All: R | All: R/W |
| testing_sessions | Own: R/W | All: R | All: R/W |
| signal_data | Own: R/W | All: R | All: R/W |
| defects | Own: R/W | All: R | All: R/W |
| calibrations | Active: R | All: R/W | All: R/W |
| reports | Own: R/W | All: R | All: R/W |
| Storage (PDFs) | Own: R/W | All: R/W | All: R/W/D |

**Legend**: R = Read, W = Write, D = Delete

---

## Performance Tips

1. **Batch Insert Signal Data**: Insert in batches of 100-1000 records
2. **Use Indexes**: All foreign keys and frequently queried columns are indexed
3. **Partition Large Tables**: Consider partitioning signal_data by date for very large datasets
4. **Archive Old Data**: Move completed sessions older than 1 year to archive tables
5. **Connection Pooling**: Use Supabase's built-in connection pooling

---

## Maintenance Queries

### Check table sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check index usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Find unused indexes
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%pkey%';
```
