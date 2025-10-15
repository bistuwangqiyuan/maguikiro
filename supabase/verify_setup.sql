-- =====================================================
-- Database Setup Verification Script
-- =====================================================
-- Run this script to verify that all tables, indexes, 
-- and policies have been created correctly

\echo '========================================='
\echo 'Verifying Magnetic Testing Instrument DB'
\echo '========================================='
\echo ''

-- Check if all tables exist
\echo 'Checking tables...'
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'testing_sessions', 'signal_data', 'defects', 'calibrations', 'reports') 
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'testing_sessions', 'signal_data', 'defects', 'calibrations', 'reports')
ORDER BY table_name;

\echo ''
\echo 'Checking RLS status...'
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✓ ENABLED'
    ELSE '✗ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'testing_sessions', 'signal_data', 'defects', 'calibrations', 'reports')
ORDER BY tablename;

\echo ''
\echo 'Checking indexes...'
SELECT 
  schemaname,
  tablename,
  indexname,
  '✓' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'testing_sessions', 'signal_data', 'defects', 'calibrations', 'reports')
ORDER BY tablename, indexname;

\echo ''
\echo 'Checking RLS policies...'
SELECT 
  schemaname,
  tablename,
  policyname,
  '✓' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'testing_sessions', 'signal_data', 'defects', 'calibrations', 'reports')
ORDER BY tablename, policyname;

\echo ''
\echo 'Checking helper functions...'
SELECT 
  routine_name,
  routine_type,
  '✓' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_active_calibration', 'is_calibration_expired', 'get_report_pdf_path', 'get_report_pdf_url', 'update_updated_at_column')
ORDER BY routine_name;

\echo ''
\echo 'Checking triggers...'
SELECT 
  trigger_name,
  event_object_table,
  '✓' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('profiles', 'testing_sessions')
ORDER BY event_object_table, trigger_name;

\echo ''
\echo 'Checking storage bucket...'
SELECT 
  id,
  name,
  CASE WHEN public THEN 'PUBLIC' ELSE 'PRIVATE' END as access,
  file_size_limit / 1024 / 1024 || ' MB' as size_limit,
  '✓' as status
FROM storage.buckets
WHERE id = 'report-pdfs';

\echo ''
\echo 'Checking storage policies...'
SELECT 
  policyname,
  '✓' as status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%report%'
ORDER BY policyname;

\echo ''
\echo '========================================='
\echo 'Verification Complete'
\echo '========================================='
\echo ''
\echo 'Summary:'
\echo '- Tables: 6 expected'
\echo '- Indexes: Multiple per table'
\echo '- RLS Policies: Multiple per table'
\echo '- Helper Functions: 5 expected'
\echo '- Triggers: 2 expected'
\echo '- Storage Buckets: 1 expected'
\echo '- Storage Policies: 5 expected'
\echo ''
\echo 'If any items are missing, re-run the migration scripts.'
