# Supabase Authentication Implementation

This document describes the Supabase authentication implementation in the mobile app.

## Overview

The mobile app uses Supabase for authentication, with session persistence via AsyncStorage and automatic session refresh.

## Architecture

### Services Layer

#### `src/services/supabaseClient.ts`
Initializes the Supabase client with AsyncStorage for session persistence.

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

#### `src/services/authService.ts`
Provides authentication methods:
- `signUp({ email, password, name })` - Register a new user
- `signInWithPassword(email, password)` - Sign in with email/password
- `signOut()` - Sign out the current user
- `getCurrentUser()` - Get the current authenticated user
- `getSession()` - Get the current session
- `refreshSession()` - Manually refresh the session
- `resetPasswordForEmail(email)` - Send a password reset email
- `onAuthStateChange(callback)` - Listen for auth state changes

### State Management

#### `src/store/authStore.ts`
Zustand store managing auth state:

**State:**
- `user` - Current user object (Supabase User type)
- `session` - Current session object (Supabase Session type)
- `isLoading` - Loading state for async operations
- `isInitialized` - Whether the store has been initialized
- `error` - Error message from last operation
- `isOnboardingCompleted` - Whether user has completed onboarding

**Actions:**
- `initialize()` - Initialize auth state on app launch
- `signUp(email, password, name?)` - Register new user
- `signIn(email, password)` - Sign in existing user
- `signOut()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `getCurrentUser()` - Fetch current user
- `refreshSession()` - Refresh authentication session
- `setOnboardingCompleted(completed)` - Mark onboarding as complete
- `checkOnboardingStatus()` - Check if onboarding is complete

### App Initialization

#### `src/App.tsx`
Waits for auth initialization before rendering the app:

```typescript
const [isReady, setIsReady] = useState(false);
const initialize = useAuthStore((state) => state.initialize);
const isInitialized = useAuthStore((state) => state.isInitialized);

useEffect(() => {
  const initializeApp = async () => {
    try {
      await initialize();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
  };
  initializeApp();
}, [initialize]);
```

### Navigation Flow

#### `src/navigation/RootNavigator.tsx`
Routes users based on authentication and onboarding status:

1. **Not Authenticated** → Auth screens (Login, Register, Forgot Password)
2. **Authenticated + Onboarding Incomplete** → Onboarding flow
3. **Authenticated + Onboarding Complete** → Main app

```typescript
const session = useAuthStore((state) => state.session);
const isOnboardingCompleted = useAuthStore((state) => state.isOnboardingCompleted);
const isLoggedIn = !!session;

// Routes: Auth → Onboarding → Main
```

### Screens

#### `src/screens/auth/LoginScreen.tsx`
- Uses `signIn()` from auth store
- Shows loading state during authentication
- Displays Supabase error messages
- Disables inputs/buttons during loading

#### `src/screens/auth/RegisterScreen.tsx`
- Uses `signUp()` from auth store
- Validates password length (min 6 characters)
- Validates password confirmation
- Shows loading state and error messages

#### `src/screens/auth/ForgotPasswordScreen.tsx`
- Uses `resetPassword()` from auth store
- Sends password reset email via Supabase
- Shows success screen after sending

## Environment Variables

Required environment variables in `.env`:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project:
1. Go to Project Settings > API
2. Copy "Project URL" and "anon/public" key

## Session Management

### Persistence
- Sessions are automatically persisted to AsyncStorage via Supabase client
- On app launch, the store checks for existing session
- Sessions are automatically refreshed when expired

### Onboarding Tracking
- Onboarding status is stored per-user in AsyncStorage
- Key format: `onboarding_completed_{userId}`
- Checked on login and app initialization

## User Profile Creation

When a user signs up, a profile is automatically created in the `users` table:

```typescript
await supabase.from('users').insert({
  id: user.id,
  email: user.email,
  name: name || email.split('@')[0],
});
```

This ensures the user exists in the public schema with RLS policies applied.

## Testing

### Auth Store Tests
Location: `src/store/__tests__/authStore.test.ts`

Tests cover:
- Initialization with/without session
- Sign up success and error cases
- Sign in with onboarding status checking
- Sign out
- Password reset
- Session refresh
- Onboarding status management

Mocks:
- `@react-native-async-storage/async-storage`
- `src/services/authService`

### Screen Tests
Locations:
- `src/screens/auth/__tests__/LoginScreen.test.tsx`
- `src/screens/auth/__tests__/RegisterScreen.test.tsx`

Tests cover:
- Rendering in different states (default, loading, error)
- User interactions (form submission, navigation)
- Validation logic
- Button/input disabled states

## Error Handling

All authentication errors from Supabase are:
1. Caught in the store actions
2. Converted to user-friendly messages
3. Stored in `error` state
4. Displayed in the UI

Common error messages:
- "Invalid credentials" - Wrong email/password
- "Email already exists" - Duplicate registration
- "Password must be at least 6 characters" - Validation error
- "Please fill in all fields" - Missing required fields

## Security Best Practices

1. **Never expose service role key** - Only use anon key in mobile app
2. **Use Row Level Security (RLS)** - All database tables have RLS enabled
3. **Persist sessions securely** - AsyncStorage is encrypted on device
4. **Auto-refresh tokens** - Prevents expired session issues
5. **Validate input** - Client-side validation before API calls

## Troubleshooting

### Session not persisting
- Check AsyncStorage permissions
- Verify Supabase client configuration
- Check for initialization errors in console

### Navigation stuck on Auth screen
- Verify session exists in auth store
- Check `isInitialized` state
- Review RootNavigator logic

### "Invalid JWT" errors
- Session may be expired - refresh should happen automatically
- Check Supabase project is active
- Verify environment variables are correct

## Future Enhancements

Possible improvements:
- [ ] Social authentication (Google, Apple)
- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Remember me functionality
- [ ] Session timeout warnings
- [ ] Multi-device session management
- [ ] Email verification enforcement
- [ ] Phone number authentication
