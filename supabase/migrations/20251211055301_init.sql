-- Initial migration: Create all tables with RLS policies
-- This migration replaces the old Prisma schema with Supabase managed tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Mirrors auth.users with FK relationship
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email for lookups
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- GOALS TABLE
-- =====================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- BARRIERS TABLE
-- =====================================================
CREATE TABLE barriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_barriers_user_id ON barriers(user_id);
CREATE INDEX idx_barriers_goal_id ON barriers(goal_id);

-- Enable RLS
ALTER TABLE barriers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barriers
CREATE POLICY "Users can view their own barriers"
  ON barriers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own barriers"
  ON barriers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own barriers"
  ON barriers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own barriers"
  ON barriers FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HABIT_PLANS TABLE
-- =====================================================
CREATE TABLE habit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  phase1_count INT NOT NULL DEFAULT 0,
  phase2_count INT NOT NULL DEFAULT 0,
  phase3_count INT NOT NULL DEFAULT 0,
  phase4_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_habit_plans_user_id ON habit_plans(user_id);
CREATE INDEX idx_habit_plans_goal_id ON habit_plans(goal_id);

-- Enable RLS
ALTER TABLE habit_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habit_plans
CREATE POLICY "Users can view their own habit plans"
  ON habit_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit plans"
  ON habit_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit plans"
  ON habit_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit plans"
  ON habit_plans FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HABITS TABLE
-- =====================================================
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  barrier_id UUID REFERENCES barriers(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES habit_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  phase INT NOT NULL,
  frequency TEXT,
  duration INT,
  priority INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT habits_phase_check CHECK (phase >= 1 AND phase <= 4),
  CONSTRAINT habits_priority_check CHECK (priority IS NULL OR (priority >= 1 AND priority <= 10))
);

-- Indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_goal_id ON habits(goal_id);
CREATE INDEX idx_habits_barrier_id ON habits(barrier_id);
CREATE INDEX idx_habits_plan_id ON habits(plan_id);
CREATE INDEX idx_habits_category ON habits(category);
CREATE INDEX idx_habits_phase ON habits(phase);
CREATE INDEX idx_habits_habit_id ON habits(id);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PLAN_PHASES TABLE
-- =====================================================
CREATE TABLE plan_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES habit_plans(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT plan_phases_phase_number_check CHECK (phase_number >= 1 AND phase_number <= 4),
  CONSTRAINT plan_phases_status_check CHECK (status IN ('pending', 'active', 'completed', 'skipped'))
);

-- Indexes
CREATE INDEX idx_plan_phases_plan_id ON plan_phases(plan_id);

-- Enable RLS
ALTER TABLE plan_phases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plan_phases
-- Users can view plan phases for their own plans
CREATE POLICY "Users can view their own plan phases"
  ON plan_phases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habit_plans
      WHERE habit_plans.id = plan_phases.plan_id
      AND habit_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own plan phases"
  ON plan_phases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habit_plans
      WHERE habit_plans.id = plan_phases.plan_id
      AND habit_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own plan phases"
  ON plan_phases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habit_plans
      WHERE habit_plans.id = plan_phases.plan_id
      AND habit_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own plan phases"
  ON plan_phases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM habit_plans
      WHERE habit_plans.id = plan_phases.plan_id
      AND habit_plans.user_id = auth.uid()
    )
  );

-- =====================================================
-- PROGRESS_ENTRIES TABLE
-- =====================================================
CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, entry_date)
);

-- Indexes
CREATE INDEX idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX idx_progress_entries_habit_id ON progress_entries(habit_id);
CREATE INDEX idx_progress_entries_habit_id_entry_date ON progress_entries(habit_id, entry_date);

-- Enable RLS
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progress_entries
CREATE POLICY "Users can view their own progress entries"
  ON progress_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress entries"
  ON progress_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress entries"
  ON progress_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress entries"
  ON progress_entries FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barriers_updated_at
  BEFORE UPDATE ON barriers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_plans_updated_at
  BEFORE UPDATE ON habit_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_phases_updated_at
  BEFORE UPDATE ON plan_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_entries_updated_at
  BEFORE UPDATE ON progress_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE users IS 'User profiles that mirror auth.users';
COMMENT ON TABLE goals IS 'User goals (health, career, personal, financial, etc.)';
COMMENT ON TABLE barriers IS 'Barriers preventing users from achieving their goals';
COMMENT ON TABLE habit_plans IS 'Plans for organizing habits across 4 journey phases';
COMMENT ON TABLE habits IS 'Individual habits assigned to goals, barriers, and plans';
COMMENT ON TABLE plan_phases IS 'Detailed phase information for habit plans';
COMMENT ON TABLE progress_entries IS 'Daily/periodic tracking of habit completion';
