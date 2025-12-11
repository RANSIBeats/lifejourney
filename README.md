# Mobile Onboarding Flow

A React Native mobile application featuring a 3-step onboarding wizard for habit formation.

## Features

### 3-Step Onboarding Wizard

#### Step 1: North Star Goal
- Captures the user's primary goal with validation
- Friendly copy and emoji to guide the user
- Character limit: 3-200 characters
- Real-time validation feedback

#### Step 2: Barriers Selection
- Preset barrier chips (Sleep, Focus, Stress, Time Management, Motivation, Energy)
- Custom barrier input with add functionality
- Multiple selection support
- Remove custom barriers with × button
- Validation: 1-10 barriers total

#### Step 3: Habit Generation & Display
- Calls habit generation endpoint (currently stubbed)
- Displays three habit layers:
  - **Foundational Habits**: Core well-being habits
  - **Goal-Specific Habits**: Directly support the North Star goal
  - **Barrier-Targeting Habits**: Address selected barriers
- Loading states with activity indicator
- Error handling with retry functionality

### Persistence
- Saves onboarding progress to AsyncStorage
- Users can resume where they left off
- Automatic state restoration on app restart

### Navigation
- Progress indicator showing current step (1/3, 2/3, 3/3)
- Back/Next button controls
- Step validation before proceeding

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Storage**: @react-native-async-storage/async-storage
- **HTTP Client**: Axios (for future API integration)
- **Testing**: Jest + React Native Testing Library

## Project Structure

```
src/
├── api/
│   ├── habits.ts                    # API calls (stubbed)
│   └── __tests__/
│       └── habits.test.ts
├── components/
│   ├── Button.tsx                   # Reusable button component
│   ├── Chip.tsx                     # Selectable chip component
│   ├── HabitCard.tsx               # Habit display card
│   ├── ProgressIndicator.tsx       # Step progress dots
│   └── __tests__/
│       ├── Button.test.tsx
│       ├── Chip.test.tsx
│       └── ProgressIndicator.test.tsx
├── screens/
│   ├── OnboardingContainer.tsx     # Main onboarding container
│   ├── Step1GoalScreen.tsx         # North Star goal input
│   ├── Step2BarriersScreen.tsx     # Barrier selection
│   └── Step3HabitsScreen.tsx       # Habit generation & display
├── store/
│   ├── onboardingStore.ts          # Zustand store
│   └── __tests__/
│       └── onboardingStore.test.ts
├── types/
│   └── onboarding.ts               # TypeScript interfaces
└── utils/
    ├── validation.ts                # Validation functions
    └── __tests__/
        └── validation.test.ts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, installed as dependency)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## API Integration

The habit generation endpoint is currently stubbed in `src/api/habits.ts`. To integrate with a real backend:

1. Set the `API_BASE_URL` environment variable
2. Uncomment the actual API call code in `generateHabits` function
3. Update the request/response types as needed

Example stubbed endpoint:
```typescript
POST /habits/generate
Body: {
  goal: string,
  barriers: string[]
}
Response: {
  foundational: Habit[],
  goalSpecific: Habit[],
  barrierTargeting: Habit[]
}
```

## State Management

The onboarding state is managed with Zustand and includes:
- Current step (1-3)
- North Star goal text
- Selected preset barriers
- Custom barriers
- Generated habits
- Loading and error states

State is automatically persisted to AsyncStorage and restored on app launch.

## Validation Rules

### North Star Goal
- Must not be empty
- Minimum 3 characters
- Maximum 200 characters

### Barriers
- At least 1 barrier must be selected
- Maximum 10 barriers total (preset + custom)
- Custom barriers are trimmed and deduplicated

## Design Decisions

1. **Zustand over Redux**: Simpler API, less boilerplate, built-in TypeScript support
2. **AsyncStorage**: Native solution for simple key-value persistence
3. **Stubbed API**: Allows frontend development and testing without backend dependency
4. **Component-based architecture**: Reusable components (Button, Chip, etc.)
5. **Comprehensive testing**: Unit tests for store, utilities, and components

## Future Enhancements

- [ ] Connect to real backend API
- [ ] Add animations between steps
- [ ] Support for habit editing after generation
- [ ] Analytics tracking for user behavior
- [ ] Accessibility improvements (screen reader support)
- [ ] Internationalization (i18n)
- [ ] Dark mode support
- [ ] Onboarding skip option
- [ ] Progress save/restore across devices
