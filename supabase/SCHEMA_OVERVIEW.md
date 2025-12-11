# Supabase Schema Overview

## Quick Reference

This document provides a quick overview of the Supabase schema design for the Habit Formation app.

### Tables Summary

| Table | Purpose | Key Fields | Relationships |
|-------|---------|------------|---------------|
| **users** | User profiles | id, email, name | → goals, barriers, habits, habit_plans, progress_entries |
| **goals** | User goals | id, user_id, title, category | ← users; → barriers, habits, habit_plans |
| **barriers** | Goal obstacles | id, user_id, goal_id, title, type | ← users, goals; → habits |
| **habit_plans** | Habit organization | id, user_id, goal_id, phase1-4_count | ← users, goals; → habits, plan_phases |
| **habits** | Individual habits | id, user_id, goal_id, plan_id, phase | ← users, goals, barriers, habit_plans; → progress_entries |
| **plan_phases** | Phase details | id, plan_id, phase_number, status | ← habit_plans |
| **progress_entries** | Daily tracking | id, user_id, habit_id, entry_date | ← users, habits |

### Key Features

1. **UUID Primary Keys**: All tables use UUID for primary keys (replaces Prisma's CUID)
2. **Row Level Security**: All tables have RLS enabled with policies for authenticated users
3. **Automatic Timestamps**: created_at and updated_at managed by triggers
4. **Optimized Indexes**: 17 indexes for efficient queries
5. **Referential Integrity**: Foreign keys with CASCADE and SET NULL rules

### Data Types Mapping

Prisma → Supabase conversions:

| Prisma Type | Supabase Type |
|-------------|---------------|
| String (id) | UUID |
| String | TEXT |
| Int | INT |
| DateTime | TIMESTAMPTZ |
| Boolean | BOOLEAN |
| @default(cuid()) | DEFAULT uuid_generate_v4() |
| @default(now()) | DEFAULT NOW() |
| @updatedAt | Trigger: update_updated_at_column() |

### Security Model

#### RLS Policies (per table)
- **SELECT**: Users can view their own records
- **INSERT**: Users can create records for themselves
- **UPDATE**: Users can modify their own records
- **DELETE**: Users can delete their own records

#### Special Case: plan_phases
Uses subquery to check ownership through habit_plans table:
```sql
EXISTS (
  SELECT 1 FROM habit_plans
  WHERE habit_plans.id = plan_phases.plan_id
  AND habit_plans.user_id = auth.uid()
)
```

### Index Strategy

| Index Type | Purpose | Example |
|------------|---------|---------|
| Single column | Fast lookups | user_id, goal_id, plan_id |
| Composite | Range queries | (habit_id, entry_date) |
| Unique | Data integrity | users(email) |
| Primary key | Row identification | All tables: id |

### Phase System

Habits are organized into 4 phases:

1. **Phase 1**: Reset & Rebuild (foundational habits)
2. **Phase 2**: Build Momentum (goal-specific habits)
3. **Phase 3**: Polish & Prepare (refinement habits)
4. **Phase 4**: Ready Window (readiness habits)

Each habit belongs to one phase (1-4), enforced by CHECK constraint.

### Habit Categories

- **foundational**: Core habits for overall wellbeing
- **goal-specific**: Habits directly supporting a goal
- **barrier-targeting**: Habits addressing specific barriers

### Progress Tracking

- One entry per habit per day (UNIQUE constraint on habit_id, entry_date)
- Boolean completion status
- Optional notes field
- Composite index on (habit_id, entry_date) for efficient date-range queries

### Constraints

#### Check Constraints
- `habits.phase`: Must be 1-4
- `habits.priority`: Must be NULL or 1-10
- `plan_phases.phase_number`: Must be 1-4
- `plan_phases.status`: Must be 'pending', 'active', 'completed', or 'skipped'

#### Unique Constraints
- `users.email`: Unique email addresses
- `progress_entries(habit_id, entry_date)`: One entry per habit per day

#### Foreign Key Rules
- **CASCADE**: Deleting parent deletes children (most relationships)
- **SET NULL**: Deleting parent nullifies FK (habits.barrier_id)

### Migration File Structure

```
supabase/migrations/20251211055301_init.sql
├── Extension Setup (uuid-ossp)
├── Table Creation (7 tables)
├── Index Creation (17 indexes)
├── RLS Enablement (7 tables)
├── Policy Creation (27 policies)
├── Trigger Function (update_updated_at_column)
├── Trigger Application (7 triggers)
└── Documentation Comments
```

### Performance Considerations

1. **Index Coverage**: All FK columns indexed for join performance
2. **Composite Indexes**: Progress entries optimized for date-range lookups
3. **RLS Efficiency**: Policies use simple equality checks on indexed columns
4. **Cascade Deletes**: Automatic cleanup reduces orphaned records

### Common Queries

#### Get user's habits for a specific phase
```sql
SELECT * FROM habits 
WHERE user_id = auth.uid() 
AND phase = 1;
-- Uses idx_habits_user_id and idx_habits_phase
```

#### Get progress for a habit over time
```sql
SELECT * FROM progress_entries
WHERE habit_id = $1
AND entry_date BETWEEN $2 AND $3
ORDER BY entry_date;
-- Uses idx_progress_entries_habit_id_entry_date
```

#### Get all data for a user's goal
```sql
SELECT 
  g.*,
  array_agg(DISTINCT b.*) as barriers,
  array_agg(DISTINCT h.*) as habits,
  array_agg(DISTINCT hp.*) as plans
FROM goals g
LEFT JOIN barriers b ON b.goal_id = g.id
LEFT JOIN habits h ON h.goal_id = g.id
LEFT JOIN habit_plans hp ON hp.goal_id = g.id
WHERE g.user_id = auth.uid()
AND g.id = $1
GROUP BY g.id;
-- Uses idx_goals_user_id, idx_barriers_goal_id, idx_habits_goal_id, idx_habit_plans_goal_id
```

### Environment Setup

Required environment variables:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

- **SUPABASE_URL**: Project URL (from Supabase dashboard)
- **SUPABASE_ANON_KEY**: Client-side operations (respects RLS)
- **SUPABASE_SERVICE_ROLE_KEY**: Backend operations (bypasses RLS)

### Migration Commands

```bash
# Start local Supabase
supabase start

# Apply migration
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# Reset database (local only)
supabase db reset

# Stop local Supabase
supabase stop
```

### File Structure

```
supabase/
├── migrations/
│   └── 20251211055301_init.sql     # Initial schema migration
├── README.md                        # Detailed documentation
├── SCHEMA_OVERVIEW.md              # This file (quick reference)
├── MIGRATION_VALIDATION.md         # Validation guide
├── config.toml                      # Supabase CLI config
└── seed.sql                         # Sample data (optional)
```

### Next Steps After Migration

1. ✅ Apply migration to local Supabase
2. ✅ Verify all tables and policies
3. ✅ Test RLS with different user contexts
4. ✅ Generate TypeScript types
5. ✅ Update application code to use Supabase client
6. ✅ Update API endpoints
7. ✅ Update tests
8. ✅ Apply to staging environment
9. ✅ Run integration tests
10. ✅ Apply to production with backup

### Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "relation already exists" | Migration already applied, check supabase_migrations table |
| RLS blocking queries | Verify auth.uid() matches user_id |
| Slow queries | Check indexes with `\di` command |
| FK violations | Ensure parent records exist before inserting children |
| Trigger not firing | Check trigger exists: `\dft` in psql |

### Support Resources

- [Full Documentation](./README.md)
- [Validation Guide](./MIGRATION_VALIDATION.md)
- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Schema Version**: 1.0.0 (Initial)  
**Created**: 2024-12-11  
**Last Updated**: 2024-12-11  
**Migration File**: `20251211055301_init.sql`
