# Journey Screen Navigation

## Overview

The Journey screen displays the user's personalized habit plan in a timeline format after completing the onboarding process. The app automatically navigates from the onboarding flow to the Journey screen upon completion.

## Navigation Flow

### 1. Onboarding Completion
- Users complete the 3-step onboarding process:
  - Step 1: Set North Star Goal
  - Step 2: Identify Barriers
  - Step 3: Review Generated Habit Plan
- Upon clicking "Get Started!" in Step 3, the app:
  - Sets `isOnboardingComplete: true` in the store
  - Saves the journey plan and completion status to AsyncStorage
  - Automatically navigates to the Journey screen

### 2. App Navigation Logic
The main `App.tsx` component handles the navigation:

```typescript
export default function App() {
  const { isOnboardingComplete, loadFromStorage } = useOnboardingStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <>
      {isOnboardingComplete ? <JourneyScreen /> : <OnboardingContainer />}
      <StatusBar style="auto" />
    </>
  );
}
```

### 3. Journey Screen Display Conditions

The Journey screen displays in these scenarios:

1. **Onboarding Complete with Journey Plan**: Shows the full timeline
2. **Onboarding Complete without Journey**: Shows error message with restart option
3. **Onboarding Incomplete**: Shows completion prompt with restart option

## Journey Timeline Features

### Phase Structure
The timeline displays four phases:
1. **Reset & Rebuild** - Foundation building and habit establishment
2. **Build Momentum** - Strengthening routines and overcoming obstacles  
3. **Polish & Prepare** - Refining habits and preparing for next level
4. **Ready Window** - Peak performance and goal achievement

### Visual States
- **Current Phase**: Purple/glowing border, indicates active phase
- **Completed Phase**: Green border, indicates finished phase
- **Locked Phase**: Gray border, indicates future phase

### Interactive Elements
- **Tap to Expand**: Tap any phase card to view assigned habits
- **Habit Details**: Shows habit name, description, and frequency
- **Responsive Design**: Adapts to device width (horizontal on tablets, vertical on phones)

### Data Sources
- Journey plan generated from onboarding data
- Habits distributed across phases based on type and priority
- Status progression managed through the store

## Technical Implementation

### Store Integration
```typescript
// Key store properties used in navigation
interface OnboardingState {
  isOnboardingComplete: boolean;
  journey: JourneyPlan | null;
  // ... other properties
}

// Actions that trigger navigation
completeOnboarding: () => void;
resetOnboarding: () => void;
```

### Data Flow
1. **Onboarding** → `submitOnboarding()` → Generate habits → `createJourneyPlan()`
2. **Journey Creation** → Distribute habits across 4 phases → Set first phase as 'current'
3. **Completion** → `completeOnboarding()` → Save state → Navigate to Journey screen
4. **Display** → Load from storage → Show Journey timeline

### Persistence
All data is persisted to AsyncStorage:
- Onboarding completion status
- Journey plan with phases and habits
- Phase status progression

## Testing Navigation

### Unit Tests
- `JourneyScreen.test.tsx` - Tests screen rendering and error states
- `JourneyTimeline.test.tsx` - Tests component interactions and styling

### Integration Testing
- Test complete onboarding flow → Journey display
- Test data persistence and reload
- Test responsive behavior across device sizes

## Restarting Onboarding

Users can restart the onboarding process at any time by:
1. Clicking "Restart Onboarding" button (shown in error states)
2. The `resetOnboarding()` action clears all data and returns to Step 1

This provides a complete reset of the habit plan and journey data.