# Mobile App - React Native with Expo

A modern, production-ready React Native mobile application built with Expo and TypeScript, featuring dark theme design, robust navigation, state management with Zustand, and async data handling with React Query.

## Features

- 📱 **Cross-platform**: Runs on iOS and Android
- 🎨 **Dark Theme**: Comprehensive dark theme tokens and styling system
- 🧭 **Navigation**: React Navigation with Auth, Onboarding, and Main tab stacks
- 🔐 **Authentication**: Complete auth flow (Login, Register, Forgot Password)
- 📊 **State Management**: Zustand for global state management
- 🔄 **Data Fetching**: React Query (TanStack Query) for efficient async data handling
- 🌐 **API Client**: Axios with environment-based configuration
- 📐 **TypeScript**: Full TypeScript support for type safety
- ✨ **Developer Experience**: ESLint, Prettier, Jest for code quality and testing

## Project Structure

```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── auth/           # Authentication screens (Login, Register, ForgotPassword)
│   │   ├── onboarding/     # Onboarding screens
│   │   └── main/           # Main app screens (Journey, Profile)
│   ├── components/         # Reusable UI components
│   ├── services/           # API and external services
│   ├── store/              # Zustand stores (auth, app state)
│   ├── navigation/         # Navigation configuration and types
│   ├── themes/             # Theme tokens and styling
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── App.tsx             # Root app component
├── index.ts                # App entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── babel.config.js         # Babel configuration with path aliases
└── jest.config.js          # Jest test configuration
```

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- For iOS: Xcode
- For Android: Android Studio

## Installation

### 1. Install Dependencies

```bash
cd apps/mobile
npm install
```

Or from the root directory:

```bash
npm install:all
```

## Development

### Start Development Server

```bash
npm start
```

This will launch the Expo CLI with options to:
- Open in iOS Simulator: Press `i`
- Open in Android Emulator: Press `a`
- Open in web browser: Press `w`
- Scan QR code with Expo Go app: Use QR code scanner

### Run on iOS Simulator

```bash
npm run ios
```

### Run on Android Emulator

```bash
npm run android
```

### Run on Web

```bash
npm run web
```

## Available Scripts

### Development
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS Simulator
- `npm run android` - Run on Android Emulator
- `npm run web` - Run web version

### Code Quality
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run Jest tests
- `npm run format` - Format code with Prettier

### Building
- `npm run eject` - Eject from Expo (not recommended for most projects)

## Configuration

### Environment Variables

Create a `.env` file in the `apps/mobile` directory:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development
```

Environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## Architecture

### Navigation Structure

The app uses a three-level navigation hierarchy:

```
RootNavigator
├── Auth Stack (when not logged in)
│   ├── Login
│   ├── Register
│   └── Forgot Password
├── Onboarding Stack (when logged in but onboarding incomplete)
│   └── Onboarding
└── Main Stack (when fully authenticated)
    ├── Journey Tab
    │   └── Journey Screen
    └── Profile Tab
        └── Profile Screen
```

### State Management

State is managed using Zustand with two main stores:

- **AuthStore** (`src/store/authStore.ts`): Manages user authentication state, login/logout
- **AppStore** (`src/store/appStore.ts`): Manages global app state like onboarding status

### API Integration

The app uses Axios with React Query for data fetching:

```typescript
// Simple usage example
const { data, isLoading } = useQuery({
  queryKey: ['journeys'],
  queryFn: () => apiClient.get('/journeys'),
});
```

### Theme System

Centralized theme tokens are defined in `src/themes/`:

```typescript
import theme from '@themes/index';

// Use in components
<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>Hello</Text>
</View>
```

## TypeScript Path Aliases

The project uses path aliases for cleaner imports:

```typescript
// Instead of:
import Button from '../../../components/Button';

// Use:
import Button from '@components/Button';
```

Available aliases:
- `@screens/*` - Screen components
- `@components/*` - Reusable UI components
- `@services/*` - External services (API, etc.)
- `@store/*` - Zustand stores
- `@themes/*` - Theme configuration
- `@navigation/*` - Navigation configuration
- `@types/*` - TypeScript types
- `@utils/*` - Utility functions

## Testing

Run tests with:

```bash
npm test
```

Tests are discovered and run by Jest using the pattern:
- `**/__tests__/**/*.[jt]s?(x)`
- `**/?(*.)+(spec|test).[jt]s?(x)`

## Code Style

### ESLint & Prettier

The project uses ESLint and Prettier for code consistency:

```bash
npm run lint       # Check linting issues
npm run format     # Format code automatically
```

### TypeScript

Type checking is available via:

```bash
npm run type-check
```

## Troubleshooting

### Metro Bundler Issues

If you encounter bundler issues, clear the cache:

```bash
expo start --clear
```

### Port Already in Use

By default, Expo uses port 19000. If it's in use:

```bash
expo start --port 19001
```

### Dependencies Issues

Clear and reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Make sure you have the correct types installed:

```bash
npm install --save-dev @types/react @types/react-native @types/node
```

## Building for Production

### For iOS

```bash
eas build --platform ios
```

### For Android

```bash
eas build --platform android
```

(Requires EAS CLI setup)

## Performance Optimization

The app includes several performance optimizations:

- React Query caching (5-minute stale time, 30-minute cache time)
- Navigation optimization with proper memoization
- Theme tokens prevent excessive re-renders
- LazyLoading and code splitting ready

## Contributing

When adding new features:

1. Follow the existing project structure
2. Use TypeScript for all new code
3. Add proper typing and use path aliases
4. Run linting and formatting before committing
5. Ensure tests pass

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)
- [TypeScript](https://www.typescriptlang.org/)

## License

MIT
