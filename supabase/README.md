# Supabase Database Schema

This directory contains the Supabase database schema and migration files for the Habit Formation app.

## Overview

The database schema manages user data, goals, barriers, habits, habit plans, and progress tracking. All tables use Row Level Security (RLS) to ensure users can only access their own data.

## Schema Design

### Tables

#### 1. `users`
Mirrors the `auth.users` table with additional profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK, FK) | References auth.users(id) |
| email | TEXT | User email (unique) |
| name | TEXT | User display name (optional) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:** `email`

---

#### 2. `goals`
User goals that habits are designed to achieve.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| user_id | UUID (FK) | References users(id) |
| title | TEXT | Goal title |
| description | TEXT | Detailed description (optional) |
| category | TEXT | Goal category (health, career, personal, financial, etc.) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:** `user_id`

---

#### 3. `barriers`
Obstacles preventing users from achieving their goals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| user_id | UUID (FK) | References users(id) |
| goal_id | UUID (FK) | References goals(id) |
| title | TEXT | Barrier title |
| description | TEXT | Detailed description (optional) |
| type | TEXT | Barrier type (psychological, environmental, social, time-based, etc.) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:** `user_id`, `goal_id`

---

#### 4. `habit_plans`
Plans organizing habits across 4 journey phases.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| user_id | UUID (FK) | References users(id) |
| goal_id | UUID (FK) | References goals(id) |
| title | TEXT | Plan title (optional) |
| description | TEXT | Plan description (optional) |
| phase1_count | INT | Number of habits in phase 1 (Reset & Rebuild) |
| phase2_count | INT | Number of habits in phase 2 (Build Momentum) |
| phase3_count | INT | Number of habits in phase 3 (Polish & Prepare) |
| phase4_count | INT | Number of habits in phase 4 (Ready Window) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:** `user_id`, `goal_id`

---

#### 5. `habits`
Individual habits assigned to goals, barriers, and plans.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| user_id | UUID (FK) | References users(id) |
| goal_id | UUID (FK) | References goals(id) |
| barrier_id | UUID (FK, nullable) | References barriers(id) |
| plan_id | UUID (FK, nullable) | References habit_plans(id) |
| title | TEXT | Habit title |
| description | TEXT | Detailed description (optional) |
| category | TEXT | Habit category (foundational, goal-specific, barrier-targeting) |
| phase | INT | Journey phase (1-4) |
| frequency | TEXT | How often to perform (daily, weekly, specific days) |
| duration | INT | Duration in minutes (optional) |
| priority | INT | Priority level 1-10 (optional) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:** `user_id`, `goal_id`, `barrier_id`, `plan_id`, `category`, `phase`, `id`

**Constraints:** 
- `phase` must be between 1 and 4
- `priority` must be between 1 and 10 (if provided)

---

#### 6. `plan_phases`
Detailed phase information for habit plans including dates and status.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| plan_id | UUID (FK) | References habit_plans(id) |
| phase_number | INT | Phase number (1-4) |
| start_date | DATE | Phase start date (optional) |
| end_date | DATE | Phase end date (optional) |
| status | TEXT | Phase status (pending, active, completed, skipped) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:** `plan_id`

**Constraints:** 
- `phase_number` must be between 1 and 4
- `status` must be one of: pending, active, completed, skipped

---

#### 7. `progress_entries`
Daily/periodic tracking of habit completion.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| user_id | UUID (FK) | References users(id) |
| habit_id | UUID (FK) | References habits(id) |
| entry_date | DATE | Date of the entry |
| completed | BOOLEAN | Whether the habit was completed |
| notes | TEXT | Optional notes about the entry |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:** `user_id`, `habit_id`, `(habit_id, entry_date)` (composite)

**Constraints:** 
- Unique constraint on `(habit_id, entry_date)` - one entry per habit per day

---

## Row Level Security (RLS)

All tables have RLS enabled with policies that:

1. **Authenticated Users** - Can only read/write rows that reference their `user_id` (matching `auth.uid()`)
2. **Service Role** - Can bypass RLS for backend operations

### Policy Structure

Each table has four standard policies:
- **SELECT**: Users can view their own records
- **INSERT**: Users can create records for themselves
- **UPDATE**: Users can modify their own records
- **DELETE**: Users can delete their own records

For `plan_phases`, policies use a subquery to check ownership through the `habit_plans` table.

---

## Relationships

```
users (1) ──→ (many) goals
users (1) ──→ (many) barriers
users (1) ──→ (many) habits
users (1) ──→ (many) habit_plans
users (1) ──→ (many) progress_entries

goals (1) ──→ (many) barriers
goals (1) ──→ (many) habits
goals (1) ──→ (many) habit_plans

barriers (1) ──→ (many) habits

habit_plans (1) ──→ (many) habits
habit_plans (1) ──→ (many) plan_phases

habits (1) ──→ (many) progress_entries
```

---

## Automatic Timestamps

All tables include `created_at` and `updated_at` columns. The `updated_at` column is automatically updated via database triggers whenever a record is modified.

---

## Migration Workflow

### Prerequisites

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Running Migrations

#### Option 1: Via Supabase CLI

1. Apply all pending migrations:
   ```bash
   supabase db push
   ```

2. Check migration status:
   ```bash
   supabase migration list
   ```

3. Generate TypeScript types from your schema:
   ```bash
   supabase gen types typescript --local > src/types/supabase.ts
   ```

#### Option 2: Via Supabase SQL Editor

1. Navigate to your project in the Supabase Dashboard
2. Go to the SQL Editor
3. Copy the contents of `migrations/20251211055301_init.sql`
4. Paste and execute the SQL

#### Option 3: Via Database Connection

```bash
psql postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres \
  -f supabase/migrations/20251211055301_init.sql
```

### Creating New Migrations

When you need to modify the schema:

```bash
# Create a new migration file
supabase migration new migration_name

# Edit the generated file in supabase/migrations/
# Then apply it
supabase db push
```

### Rolling Back Migrations

To revert the most recent migration:

```bash
supabase db reset
```

**Warning:** This will reset your entire local database. For production, you'll need to create a rollback migration manually.

---

## Environment Variables

Required environment variables for connecting to Supabase:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

- **SUPABASE_URL**: Your project URL from the Supabase dashboard
- **SUPABASE_ANON_KEY**: Public anonymous key for client-side operations (respects RLS)
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key for backend operations (bypasses RLS)

Get these values from your Supabase project settings:
1. Go to Project Settings > API
2. Copy the values under "Project URL" and "Project API keys"

---

## Local Development

### Setting up Local Supabase

1. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

2. Start local Supabase services:
   ```bash
   supabase start
   ```

3. Apply migrations to local database:
   ```bash
   supabase db push
   ```

4. Access local services:
   - Studio: http://localhost:54323
   - API: http://localhost:54321

5. Stop local services:
   ```bash
   supabase stop
   ```

### Resetting Local Database

To reset your local database to a clean state:

```bash
supabase db reset
```

This will:
1. Drop the database
2. Recreate it
3. Apply all migrations in order

---

## Testing

### Testing RLS Policies

You can test RLS policies using the SQL editor:

```sql
-- Set the role to authenticated user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- Test SELECT policy
SELECT * FROM goals;

-- Reset to default role
RESET ROLE;
```

### Verifying Indexes

Check that indexes are created correctly:

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## Best Practices

1. **Always use migrations** - Never modify the database schema directly
2. **Test locally first** - Use local Supabase to test migrations before applying to production
3. **Use transactions** - Wrap related schema changes in transactions
4. **Document changes** - Add comments to complex migrations
5. **Backup before migrations** - Always backup production data before running migrations
6. **Use service role carefully** - Only use service role keys on the backend, never expose them to clients
7. **Monitor RLS policies** - Regularly audit RLS policies to ensure they're working as expected

---

## Troubleshooting

### Migration fails with "relation already exists"

The migration has already been applied. Check migration status:
```bash
supabase migration list
```

### RLS policies blocking legitimate queries

1. Verify the user is authenticated
2. Check that `auth.uid()` matches the `user_id` in the query
3. Test policies using the SQL editor with `SET ROLE` commands

### Slow queries

1. Verify indexes are created: Check `pg_indexes`
2. Use `EXPLAIN ANALYZE` to identify bottlenecks
3. Consider adding composite indexes for common query patterns

### Connection issues

1. Verify environment variables are set correctly
2. Check that your IP is whitelisted in Supabase settings
3. Ensure you're using the correct project URL and keys

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
