# Supabase Database Setup Instructions

Follow these step-by-step instructions to set up the database for the Magnetic Testing Instrument application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A Supabase project created
- Your Supabase project URL and anon key

## Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar

## Step 2: Run Initial Schema Migration

1. In the SQL Editor, click **New Query**
2. Open the file `supabase/migrations/001_initial_schema.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. Wait for the success message: "Success. No rows returned"

This creates:
- ✓ 6 database tables (profiles, testing_sessions, signal_data, defects, calibrations, reports)
- ✓ All indexes for query optimization
- ✓ Row Level Security (RLS) policies
- ✓ Helper functions
- ✓ Triggers for automatic timestamp updates

## Step 3: Run Storage Setup Migration

1. In the SQL Editor, click **New Query** again
2. Open the file `supabase/migrations/002_storage_setup.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**
6. Wait for the success message

This creates:
- ✓ Storage bucket for PDF reports
- ✓ Storage RLS policies
- ✓ Storage helper functions

## Step 4: Verify Storage Bucket

1. Click on **Storage** in the left sidebar
2. You should see a bucket named **report-pdfs**
3. Click on it to verify settings:
   - Public: **false** (private)
   - File size limit: **50 MB**
   - Allowed MIME types: **application/pdf**

If the bucket doesn't appear, create it manually:
1. Click **New bucket**
2. Name: `report-pdfs`
3. Public: **Off**
4. File size limit: `52428800` (50MB in bytes)
5. Allowed MIME types: `application/pdf`

## Step 5: Create Your First Admin User

1. Go to **Authentication** → **Users** in the Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**
5. Copy the user's UUID (you'll see it in the users list)

6. Go back to **SQL Editor** and run this query (replace `YOUR_USER_UUID` with the actual UUID):

```sql
INSERT INTO profiles (id, username, full_name, role)
VALUES ('YOUR_USER_UUID', 'admin', 'System Administrator', 'admin');
```

## Step 6: Verify Setup

Run the verification script to ensure everything is set up correctly:

1. In SQL Editor, open `supabase/verify_setup.sql`
2. Copy and paste the contents
3. Click **Run**
4. Review the output to ensure all components are created

Expected results:
- 6 tables with RLS enabled
- Multiple indexes per table
- Multiple RLS policies per table
- 5 helper functions
- 2 triggers
- 1 storage bucket
- 5 storage policies

## Step 7: Update Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Update your `.env` file in the project root:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 8: Test Database Connection

Run this test query in SQL Editor to verify everything works:

```sql
-- Test 1: Check if you can query profiles
SELECT COUNT(*) as profile_count FROM profiles;

-- Test 2: Check RLS is working (should return only your profile)
SELECT * FROM profiles WHERE id = auth.uid();

-- Test 3: Check helper function
SELECT * FROM get_active_calibration('standard');

-- Test 4: Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'report-pdfs';
```

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Make sure you ran the migration scripts in order (001 before 002)

### Issue: "permission denied for table"
**Solution**: Check that RLS policies are enabled. Run:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Issue: Storage bucket not created
**Solution**: Create it manually through the Storage UI (see Step 4)

### Issue: Can't insert into profiles table
**Solution**: Make sure the user exists in `auth.users` first, then insert into profiles

### Issue: RLS policies blocking access
**Solution**: Verify your user has the correct role in the profiles table:
```sql
SELECT id, username, role FROM profiles WHERE id = auth.uid();
```

## Next Steps

After completing the database setup:

1. ✓ Database schema is ready
2. → Continue with Task 3: Type definitions and interfaces
3. → Continue with Task 4: Supabase client封装

## Database Maintenance

### Backup
Supabase automatically backs up your database. For manual backups:
- Go to **Database** → **Backups** in the dashboard
- Click **Create backup**

### Monitoring
- Go to **Database** → **Roles** to monitor connections
- Go to **Database** → **Extensions** to manage PostgreSQL extensions
- Check **Logs** for any errors or issues

### Performance
The schema includes optimized indexes for common queries. Monitor performance in:
- **Database** → **Query Performance**

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the migration files for comments and explanations
3. Check the project's design document: `.kiro/specs/magnetic-testing-instrument/design.md`

## Migration History

| File | Description | Status |
|------|-------------|--------|
| 001_initial_schema.sql | Core database tables and RLS | ✓ Ready |
| 002_storage_setup.sql | Storage bucket and policies | ✓ Ready |

---

**Important**: Keep your Supabase credentials secure and never commit them to version control!
