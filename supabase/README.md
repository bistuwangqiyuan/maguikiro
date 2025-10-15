# Supabase Database Setup

This directory contains SQL migration files for setting up the Magnetic Testing Instrument database schema.

## Migration Files

1. **001_initial_schema.sql** - Creates all database tables, indexes, RLS policies, and helper functions
2. **002_storage_setup.sql** - Configures storage bucket for PDF reports and storage policies

## Tables Created

### Core Tables
- **profiles** - User profiles extending Supabase Auth
- **testing_sessions** - Magnetic testing session records
- **signal_data** - Raw signal measurements (optimized for high-volume data)
- **defects** - Detected defects and anomalies
- **calibrations** - System calibration records
- **reports** - Generated test reports metadata

### Storage
- **report-pdfs** bucket - Stores generated PDF reports (50MB limit, PDF only)

## Security Features

All tables have Row Level Security (RLS) enabled with the following access patterns:

- **Operators**: Can view and manage their own sessions, data, and reports
- **Engineers**: Can view all data, create calibrations
- **Admins**: Full access to all data and user management

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `001_initial_schema.sql`
4. Click **Run** to execute
5. Repeat for `002_storage_setup.sql`

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Manual SQL Execution

Connect to your PostgreSQL database and run:

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/002_storage_setup.sql
```

## Post-Migration Setup

### 1. Create Initial Admin User

After running migrations, create your first admin user:

1. Sign up a user through Supabase Auth (Dashboard or API)
2. Get the user's UUID from the `auth.users` table
3. Insert a profile record:

```sql
INSERT INTO profiles (id, username, full_name, role)
VALUES ('your-user-uuid', 'admin', 'Administrator', 'admin');
```

### 2. Verify Storage Bucket

Check that the `report-pdfs` bucket was created:

1. Go to **Storage** in Supabase Dashboard
2. Verify `report-pdfs` bucket exists
3. Check bucket settings:
   - Public: **false**
   - File size limit: **50MB**
   - Allowed MIME types: **application/pdf**

### 3. Test RLS Policies

Test that RLS policies work correctly:

```sql
-- As operator, should only see own sessions
SELECT * FROM testing_sessions;

-- As admin, should see all sessions
SELECT * FROM testing_sessions;
```

## Database Schema Diagram

```
profiles (extends auth.users)
  ↓
testing_sessions
  ↓
  ├── signal_data (many)
  ├── defects (many)
  └── reports (many)

calibrations (independent)
```

## Indexes

Performance indexes are created on:
- Foreign key columns
- Frequently queried columns (status, dates, roles)
- Composite indexes for common query patterns

## Helper Functions

- `get_active_calibration(cal_type)` - Get the current active calibration
- `is_calibration_expired(calibration_id)` - Check if calibration is expired
- `get_report_pdf_path(report_id)` - Generate storage path for PDF
- `get_report_pdf_url(report_id)` - Get storage URL for PDF

## Triggers

- `update_updated_at_column()` - Automatically updates `updated_at` timestamp on record updates

## Data Types

### JSONB Columns

**testing_sessions.parameters** structure:
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

**calibrations.coefficients** structure:
```json
{
  "gain_correction": 1.05,
  "phase_offset": 0.02,
  "amplitude_scale": 1.0
}
```

## Maintenance

### Backup

Regular backups are handled by Supabase automatically. For manual backups:

```bash
supabase db dump -f backup.sql
```

### Monitoring

Monitor table sizes and query performance:

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Troubleshooting

### RLS Policy Issues

If users can't access data they should be able to:

1. Check user's role in profiles table
2. Verify RLS policies are enabled
3. Test policies with `EXPLAIN` queries
4. Check Supabase logs for policy violations

### Storage Issues

If PDF uploads fail:

1. Verify bucket exists and is configured correctly
2. Check file size (must be < 50MB)
3. Verify MIME type is `application/pdf`
4. Check storage RLS policies
5. Verify user has access to the associated report

### Performance Issues

If queries are slow:

1. Check if indexes are being used (`EXPLAIN ANALYZE`)
2. Consider adding composite indexes for common queries
3. Archive old signal_data to separate table
4. Use connection pooling (Supabase handles this)

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| 001 | 2025-01-07 | Initial schema with all tables and RLS |
| 002 | 2025-01-07 | Storage bucket and policies |

## Contact

For issues or questions about the database schema, refer to the design document at `.kiro/specs/magnetic-testing-instrument/design.md`.
