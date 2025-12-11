# Migration Validation Guide

This document provides instructions for validating the Supabase schema migration before applying it to production.

## Pre-Migration Checklist

Before running the migration, verify:

- ✅ **7 Tables Created**: users, goals, barriers, habit_plans, habits, plan_phases, progress_entries
- ✅ **RLS Enabled**: All tables have Row Level Security enabled
- ✅ **27 Policies**: Complete CRUD policies for authenticated users
- ✅ **17 Indexes**: Optimized indexes on user_id, goal_id, plan_id, habit_id, and composite indexes
- ✅ **Triggers**: Automatic updated_at timestamp updates
- ✅ **Foreign Keys**: Proper CASCADE and SET NULL behavior

## Validation Steps

### 1. Local Testing (Recommended)

Test the migration locally before applying to production:

```bash
# Start local Supabase
supabase start

# Apply the migration
supabase db push

# Verify tables were created
supabase db diff

# Check RLS policies
supabase db inspect
```

### 2. Manual SQL Validation

If you prefer to validate the SQL manually:

```bash
# Check for syntax errors (requires PostgreSQL client)
psql -U postgres -d postgres --dry-run -f supabase/migrations/20251211055301_init.sql

# Or use the Supabase SQL editor to run the migration
```

### 3. Post-Migration Verification

After applying the migration, run these queries to verify:

#### Check All Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- barriers
- goals
- habit_plans
- habits
- plan_phases
- progress_entries
- users

#### Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

#### Check Indexes
```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should show 17 indexes including composite index on (habit_id, entry_date)

#### Verify Foreign Keys
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

#### Test RLS Policies

Test that RLS policies work correctly:

```sql
-- Create a test user (or use existing)
-- Set the user context
SET request.jwt.claim.sub = 'test-user-uuid';
SET ROLE authenticated;

-- Try to insert a record
INSERT INTO users (id, email, name) 
VALUES ('test-user-uuid', 'test@example.com', 'Test User');

-- Verify you can only see your own data
SELECT * FROM users;

-- Reset role
RESET ROLE;
```

#### Verify Triggers
```sql
-- Insert a test record
INSERT INTO users (id, email, name) 
VALUES ('test-uuid', 'test@example.com', 'Test');

-- Wait a moment and update
UPDATE users SET name = 'Test Updated' WHERE id = 'test-uuid';

-- Check that updated_at changed
SELECT id, created_at, updated_at FROM users WHERE id = 'test-uuid';
-- updated_at should be later than created_at

-- Cleanup
DELETE FROM users WHERE id = 'test-uuid';
```

### 4. Performance Testing

Test query performance with sample data:

```sql
-- Create test data (100 users with 1000 habits each)
-- Then run EXPLAIN ANALYZE on common queries

EXPLAIN ANALYZE
SELECT h.* 
FROM habits h
WHERE h.user_id = 'test-user-uuid'
  AND h.phase = 1;

EXPLAIN ANALYZE
SELECT pe.*
FROM progress_entries pe
WHERE pe.habit_id = 'test-habit-uuid'
  AND pe.entry_date BETWEEN '2024-01-01' AND '2024-12-31';
```

Look for:
- Index scans (not sequential scans)
- Low execution time
- Reasonable number of rows scanned

### 5. Security Audit

Verify that RLS policies prevent unauthorized access:

```sql
-- Test 1: User A cannot see User B's data
SET request.jwt.claim.sub = 'user-a-uuid';
SET ROLE authenticated;
SELECT * FROM goals WHERE user_id = 'user-b-uuid';
-- Should return 0 rows

-- Test 2: Unauthenticated users cannot access data
RESET ROLE;
SELECT * FROM goals;
-- Should be blocked by RLS

-- Test 3: Service role can bypass RLS
SET ROLE service_role;
SELECT * FROM goals;
-- Should return all rows
RESET ROLE;
```

## Common Issues and Solutions

### Issue: "relation already exists"
**Solution**: The migration has already been applied. Check `supabase_migrations` table to verify.

### Issue: RLS blocking legitimate queries
**Solution**: Verify that `auth.uid()` is correctly set and matches the `user_id` in the query.

### Issue: Slow query performance
**Solution**: Check that indexes exist using `\di` in psql or the query above. Consider adding composite indexes for complex queries.

### Issue: Foreign key constraint violations
**Solution**: Ensure parent records exist before inserting child records. Check CASCADE rules are correct.

## Rollback Procedure

If you need to rollback the migration:

```sql
-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS progress_entries CASCADE;
DROP TABLE IF EXISTS plan_phases CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS habit_plans CASCADE;
DROP TABLE IF EXISTS barriers CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Remove the UUID extension if no longer needed
-- DROP EXTENSION IF EXISTS "uuid-ossp";
```

**Note**: Only rollback in development/staging. For production, create a new migration to revert changes.

## Migration Checklist

Before marking this migration as complete:

- [ ] Migration runs without errors locally
- [ ] All 7 tables created successfully
- [ ] All 17 indexes created successfully
- [ ] RLS enabled on all tables
- [ ] All 27 policies created successfully
- [ ] Triggers working correctly (updated_at auto-updates)
- [ ] Foreign keys enforce referential integrity
- [ ] Sample queries return expected results
- [ ] RLS policies tested with different user contexts
- [ ] Performance is acceptable with sample data
- [ ] Documentation updated
- [ ] Team notified of schema changes

## Next Steps

After successful migration:

1. Update your application code to use the new schema
2. Generate TypeScript types: `supabase gen types typescript`
3. Update API endpoints to work with Supabase
4. Update tests to reflect new schema
5. Monitor query performance in production
6. Set up database backups and monitoring

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review RLS guides: https://supabase.com/docs/guides/auth/row-level-security
- Consult the team's internal documentation
