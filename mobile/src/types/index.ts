// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  created_at: string;
  last_login?: string;
}

// User profile data for onboarding
export interface UserProfile {
  user_id: string;
  age?: number;
  gender?: string;
  occupation?: string;
  timezone: string;
  primary_goals: string[];
  personality_traits: string[];
  lifestyle_preferences: any;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  notification_preferences: any;
  onboarding_completed: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Goal types
export interface Goal {
  id: string;
  user_id: string;
  goal_type: 'fitness' | 'productivity' | 'health' | 'learning' | 'social' | 'personal';
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  deadline?: string;
  priority: 1 | 2 | 3; // 1=high, 2=medium, 3=low
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  habits_count?: number;
  completed_habits?: number;
}

export interface CreateGoalData {
  goalType: Goal['goal_type'];
  title: string;
  description?: string;
  targetValue?: number;
  deadline?: string;
  priority?: Goal['priority'];
}

// Habit types
export interface Habit {
  id: string;
  user_id: string;
  goal_id?: string;
  name: string;
  description?: string;
  category: 'daily' | 'weekly' | 'custom';
  frequency_type: 'daily' | 'weekly' | 'monthly';
  frequency_value: number;
  target_days?: string[]; // JSON array of days
  reminder_time?: string;
  is_active: boolean;
  streak_count: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
  goal_title?: string;
  total_entries?: number;
  completed_entries?: number;
  today_entry?: number;
  today_status?: 'completed' | 'missed' | 'skipped';
}

export interface CreateHabitData {
  name: string;
  description?: string;
  category: Habit['category'];
  frequencyType: Habit['frequency_type'];
  frequencyValue?: number;
  targetDays?: string[];
  reminderTime?: string;
  goalId?: string;
}

// Progress types
export interface HabitProgress {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  status: 'completed' | 'missed' | 'skipped';
  completed_at?: string;
  notes?: string;
  mood_rating?: number; // 1-5 scale
  created_at: string;
  updated_at: string;
  habit_name?: string;
  category?: Habit['category'];
  goal_title?: string;
}

export interface UpdateProgressData {
  status: HabitProgress['status'];
  completedAt?: string;
  notes?: string;
  moodRating?: number;
}

export interface ProgressStats {
  total_entries: number;
  completed_entries: number;
  missed_entries: number;
  skipped_entries: number;
  completion_rate: number;
  avg_mood_rating: number;
}

export interface StreakInfo {
  streak_count: number;
  best_streak: number;
  is_completed?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  details?: any[];
}

// Navigation types
export interface AuthStackParamList {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  Onboarding: undefined;
}

export interface MainStackParamList {
  Home: undefined;
  Habits: undefined;
  Progress: undefined;
  Profile: undefined;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | string[];
}