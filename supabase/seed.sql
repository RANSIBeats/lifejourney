-- Seed file for local development and testing
-- This file is optional and provides sample data for testing

-- Note: This seed assumes you have test users in auth.users
-- You can create test users through the Supabase Studio or using the auth API

-- Example usage:
-- 1. Create a test user in Supabase Studio (Authentication > Users)
-- 2. Replace 'YOUR_USER_ID_HERE' below with the actual user ID
-- 3. Run this seed file

-- Uncomment and modify the following to add seed data:

/*
-- Insert a test user profile
INSERT INTO users (id, email, name)
VALUES
  ('YOUR_USER_ID_HERE', 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Insert sample goals
INSERT INTO goals (id, user_id, title, description, category)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', 'Get Healthier', 'Improve overall health and fitness', 'health'),
  ('550e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', 'Career Growth', 'Advance in my career', 'career')
ON CONFLICT (id) DO NOTHING;

-- Insert sample barriers
INSERT INTO barriers (id, user_id, goal_id, title, description, type)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001', 'Lack of Time', 'Too busy with work to exercise', 'time-based'),
  ('650e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001', 'Lack of Motivation', 'Difficulty staying motivated', 'psychological')
ON CONFLICT (id) DO NOTHING;

-- Insert sample habit plan
INSERT INTO habit_plans (id, user_id, goal_id, title, description, phase1_count, phase2_count, phase3_count, phase4_count)
VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001', 'Health Journey', '90-day health improvement plan', 2, 2, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert sample habits
INSERT INTO habits (id, user_id, goal_id, plan_id, title, description, category, phase, frequency, duration, priority)
VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Morning Walk', '15-minute walk every morning', 'foundational', 1, 'daily', 15, 8),
  ('850e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Drink Water', 'Drink 8 glasses of water', 'foundational', 1, 'daily', NULL, 9),
  ('850e8400-e29b-41d4-a716-446655440003', 'YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Gym Session', '30-minute gym workout', 'goal-specific', 2, 'weekly', 30, 7)
ON CONFLICT (id) DO NOTHING;

-- Insert sample plan phases
INSERT INTO plan_phases (id, plan_id, phase_number, start_date, end_date, status)
VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', 'active'),
  ('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 2, CURRENT_DATE + INTERVAL '22 days', CURRENT_DATE + INTERVAL '42 days', 'pending'),
  ('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 3, CURRENT_DATE + INTERVAL '43 days', CURRENT_DATE + INTERVAL '63 days', 'pending'),
  ('950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', 4, CURRENT_DATE + INTERVAL '64 days', CURRENT_DATE + INTERVAL '90 days', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert sample progress entries
INSERT INTO progress_entries (id, user_id, habit_id, entry_date, completed, notes)
VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', '850e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, true, 'Great morning walk!'),
  ('a50e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', '850e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, true, NULL),
  ('a50e8400-e29b-41d4-a716-446655440003', 'YOUR_USER_ID_HERE', '850e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', true, NULL),
  ('a50e8400-e29b-41d4-a716-446655440004', 'YOUR_USER_ID_HERE', '850e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', false, 'Forgot to track')
ON CONFLICT (habit_id, entry_date) DO NOTHING;
*/
