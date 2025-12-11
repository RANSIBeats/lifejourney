# Mobile App

React Native mobile application built with Expo and TypeScript.

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start Development

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS
- Press `a` for Android
- Press `w` for web

## Available Commands

```bash
# Development
npm start          # Start Expo development server
npm run ios        # Open iOS Simulator
npm run android    # Open Android Emulator
npm run web        # Open web version

# Code Quality
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
npm test           # Run Jest tests

# Building
npm run eject      # Eject from Expo (careful!)
```

## Project Structure

```
src/
├── screens/          # Screen components
│   ├── auth/        # Login, Register, ForgotPassword
│   ├── onboarding/  # Onboarding flow
│   └── main/        # Journey, Profile
├── components/       # Reusable UI components
├── services/         # API clients and external services
├── store/            # Zustand state stores
├── navigation/       # React Navigation setup
├── themes/           # Theme tokens and styling
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## Configuration

### Environment Variables

Edit `.env` to configure API endpoints:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development
```

## Theme

The app uses a dark theme system. Theme tokens are defined in `src/themes/`:

- Colors
- Spacing scales
- Typography
- Border radius

Use the theme in your components:

```typescript
import theme from '@themes/index';

<Text style={{ color: theme.colors.text }}>Hello</Text>
```

## State Management

Zustand stores are located in `src/store/`:

- `authStore.ts` - User authentication
- `appStore.ts` - Global app state

```typescript
import { useAuthStore } from '@store/authStore';

const user = useAuthStore(state => state.user);
```

## Data Fetching

Use React Query for async data:

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['journeys'],
  queryFn: fetchJourneys,
});
```

## Debugging

### Enable Debug Menu

Shake your device or press Ctrl+M (Android) / Cmd+D (iOS) in the simulator.

### Network Requests

Use your API client:

```typescript
import apiClient from '@services/api';

const response = await apiClient.get('/endpoint');
```

## Type Checking

```bash
npm run type-check
```

## Testing

```bash
npm test
```

## Linting and Formatting

```bash
npm run lint     # Check code style
npm run format   # Auto-format code
```

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript](https://www.typescriptlang.org/)
