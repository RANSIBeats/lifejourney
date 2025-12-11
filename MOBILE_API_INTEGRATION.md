# Mobile App - Backend API Integration

This document describes how the React Native mobile app integrates with the Habit AI backend service.

## Overview

The mobile app communicates with the backend server to:
1. Generate personalized habit plans using the `/habits/generate` endpoint
2. Persist habits in the backend database
3. Sync user progress and goals

## Setup Instructions

### 1. Configure API Base URL

Update your `.env` file in `apps/mobile/`:

```env
# For local development
EXPO_PUBLIC_API_URL=http://localhost:3000

# For staging
EXPO_PUBLIC_API_URL=https://api-staging.example.com

# For production
EXPO_PUBLIC_API_URL=https://api.example.com
```

### 2. Update API Client

Modify `apps/mobile/src/services/api.ts` to ensure it uses the correct base URL:

```typescript
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = // get from auth store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### 3. Create Habit Generation Hook

Create `apps/mobile/src/hooks/useGenerateHabits.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

interface Barrier {
  title: string;
  description?: string;
  type?: string;
}

export interface GenerateHabitsRequest {
  userId: string;
  goalTitle: string;
  goalDescription?: string;
  goalCategory?: string;
  barriers: Barrier[];
}

interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'foundational' | 'goal-specific' | 'barrier-targeting';
  phase: 1 | 2 | 3 | 4;
  frequency: string;
  duration?: number;
  priority: number;
}

interface GenerateHabitsResponse {
  planId: string;
  goalId: string;
  habits: Habit[];
  summary: {
    foundationalCount: number;
    goalSpecificCount: number;
    barrierTargetingCount: number;
    totalCount: number;
  };
}

export function useGenerateHabits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateHabitsRequest) => {
      const response = await api.post<{
        success: boolean;
        data: GenerateHabitsResponse;
      }>('/habits/generate', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
```

## Usage Example

### Basic Habit Generation Flow

```typescript
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button } from '@/components/Button';
import { useGenerateHabits } from '@/hooks/useGenerateHabits';

export function HabitGenerationScreen() {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [barriers, setBarriers] = useState([{ title: '', description: '' }]);

  const { mutate, isPending, error } = useGenerateHabits();

  const handleAddBarrier = () => {
    setBarriers([...barriers, { title: '', description: '' }]);
  };

  const handleUpdateBarrier = (index: number, field: string, value: string) => {
    const updated = [...barriers];
    updated[index] = { ...updated[index], [field]: value };
    setBarriers(updated);
  };

  const handleRemoveBarrier = (index: number) => {
    setBarriers(barriers.filter((_, i) => i !== index));
  };

  const handleGenerateHabits = () => {
    // Validation
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (barriers.filter((b) => b.title.trim()).length === 0) {
      Alert.alert('Error', 'Please add at least one barrier');
      return;
    }

    mutate({
      userId: 'current-user-id', // Get from auth store
      goalTitle,
      goalDescription,
      goalCategory,
      barriers: barriers
        .filter((b) => b.title.trim())
        .map((b) => ({
          title: b.title.trim(),
          description: b.description?.trim(),
          type: 'user-defined',
        })),
    });
  };

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Generating your personalized habits...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
        <Button onPress={() => window.location.reload()}>Try Again</Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Define Your Goal
      </Text>

      <Text style={{ marginBottom: 8 }}>Goal Title *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          marginBottom: 16,
          borderRadius: 8,
        }}
        placeholder="e.g., Get Fit, Learn Spanish"
        value={goalTitle}
        onChangeText={setGoalTitle}
      />

      <Text style={{ marginBottom: 8 }}>Description</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          marginBottom: 16,
          borderRadius: 8,
          minHeight: 80,
        }}
        placeholder="Describe your goal in detail"
        value={goalDescription}
        onChangeText={setGoalDescription}
        multiline
      />

      <Text style={{ marginBottom: 8 }}>Category</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
        }}
        placeholder="e.g., health, career, personal"
        value={goalCategory}
        onChangeText={setGoalCategory}
      />

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        What barriers might you face? *
      </Text>

      {barriers.map((barrier, index) => (
        <View key={index} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Barrier {index + 1}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 12,
              marginBottom: 8,
              borderRadius: 8,
            }}
            placeholder="Barrier title"
            value={barrier.title}
            onChangeText={(value) => handleUpdateBarrier(index, 'title', value)}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 12,
              marginBottom: 8,
              borderRadius: 8,
            }}
            placeholder="Describe this barrier"
            value={barrier.description || ''}
            onChangeText={(value) => handleUpdateBarrier(index, 'description', value)}
          />
          {index > 0 && (
            <Button
              onPress={() => handleRemoveBarrier(index)}
              variant="secondary"
            >
              Remove
            </Button>
          )}
        </View>
      ))}

      <Button onPress={handleAddBarrier} variant="secondary" style={{ marginBottom: 20 }}>
        + Add Another Barrier
      </Button>

      <Button onPress={handleGenerateHabits} disabled={isPending}>
        {isPending ? 'Generating...' : 'Generate My Habits'}
      </Button>
    </ScrollView>
  );
}
```

### Display Generated Habits

```typescript
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@/themes';

interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'foundational' | 'goal-specific' | 'barrier-targeting';
  phase: 1 | 2 | 3 | 4;
  frequency: string;
  duration?: number;
  priority: number;
}

interface HabitDisplayProps {
  habits: Habit[];
  phase?: number;
}

export function HabitDisplay({ habits, phase }: HabitDisplayProps) {
  const theme = useTheme();

  const filtered = phase ? habits.filter((h) => h.phase === phase) : habits;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'foundational':
        return '#4A90E2';
      case 'goal-specific':
        return '#7ED321';
      case 'barrier-targeting':
        return '#F5A623';
      default:
        return '#999';
    }
  };

  return (
    <View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.habitCard,
              { borderLeftColor: getCategoryColor(item.category) },
            ]}
          >
            <Text style={styles.habitTitle}>{item.title}</Text>
            <Text style={styles.habitDescription}>{item.description}</Text>

            <View style={styles.habitMeta}>
              <Text style={styles.metaItem}>📅 {item.frequency}</Text>
              {item.duration && (
                <Text style={styles.metaItem}>⏱️ {item.duration}min</Text>
              )}
              <Text style={styles.metaItem}>⭐ {item.priority}/10</Text>
            </View>

            <View style={styles.badges}>
              <Text
                style={[
                  styles.badge,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              >
                {item.category}
              </Text>
              <Text style={styles.badge}>Phase {item.phase}</Text>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  habitMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    fontSize: 12,
    color: '#666',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
```

## Error Handling

Always handle potential errors from the API:

```typescript
const { mutate, error, isError } = useGenerateHabits();

// In your component
if (isError) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ color: 'red', fontSize: 16, marginBottom: 10 }}>
        Failed to generate habits
      </Text>
      <Text style={{ marginBottom: 20 }}>
        {error instanceof Error ? error.message : 'Unknown error occurred'}
      </Text>
      <Button onPress={() => mutate(previousData)}>Retry</Button>
    </View>
  );
}
```

## Network Configuration

### iOS Configuration

For local development on iOS, add to `Info.plist`:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app needs access to your local network to connect to the development server</string>
<key>NSBonjourServices</key>
<array>
  <string>_http._tcp</string>
  <string>_ws._tcp</string>
</array>
```

Or in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSLocalNetworkUsageDescription": "This app needs access to your local network",
      "NSBonjourServices": ["_http._tcp", "_ws._tcp"]
    }
  }
}
```

### Android Configuration

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Testing the Integration

### Using Expo Go with Local Server

1. Get your machine's local IP:

```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

2. Update `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000
```

3. Start both server and Expo:

```bash
# Terminal 1: Server
cd apps/server
npm run dev

# Terminal 2: Mobile app
cd apps/mobile
npm start
```

### Using Mock Data

To test without a running server, set in `apps/server/.env`:

```env
USE_MOCK_AI=true
```

The server will use pre-configured mock habits instead of calling OpenAI.

## API Response Handling

The endpoint returns habits organized by category and phase:

```typescript
interface GenerateHabitsResponse {
  planId: string;           // Unique plan identifier
  goalId: string;           // Associated goal
  habits: Habit[];          // Generated habits
  summary: {
    foundationalCount: number;      // Number of foundational habits
    goalSpecificCount: number;      // Number of goal-specific habits
    barrierTargetingCount: number;  // Number of barrier-targeting habits
    totalCount: number;             // Total habits generated
  };
}
```

### Habit Phases Explained

Habits are distributed across 4 journey phases:

- **Phase 1**: Introduction - Start simple, build momentum
- **Phase 2**: Building - Increase complexity, add complementary habits
- **Phase 3**: Reinforcement - Consolidate habits, add more challenges
- **Phase 4**: Mastery - Advanced practices, full integration

## Storing Generated Plans

After generation, store the plan in your app state:

```typescript
import { create } from 'zustand';

interface HabitPlan {
  planId: string;
  goalId: string;
  habits: Habit[];
  generatedAt: string;
}

interface HabitStore {
  currentPlan: HabitPlan | null;
  setCurrentPlan: (plan: HabitPlan) => void;
  clearPlan: () => void;
}

export const useHabitStore = create<HabitStore>((set) => ({
  currentPlan: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  clearPlan: () => set({ currentPlan: null }),
}));
```

Then update your component:

```typescript
const { mutate } = useGenerateHabits();
const { setCurrentPlan } = useHabitStore();

const handleGenerateHabits = () => {
  mutate(
    { userId, goalTitle, goalDescription, goalCategory, barriers },
    {
      onSuccess: (data) => {
        setCurrentPlan({
          ...data,
          generatedAt: new Date().toISOString(),
        });
        // Navigate to review screen
        navigation.navigate('ReviewHabits');
      },
    }
  );
};
```

## Troubleshooting

### Cannot Connect to Server

1. Check server is running: `curl http://localhost:3000/health`
2. Check IP address in `.env`
3. Check firewall allows port 3000
4. Check CORS configuration in server `.env`

### Validation Errors

Check error response for specific field issues:

```typescript
if (error?.response?.status === 400) {
  const details = error.response.data.details;
  details.forEach((err) => {
    console.log(`${err.path}: ${err.message}`);
  });
}
```

### Slow Generation

- First call to OpenAI may take 3-5 seconds
- Check network connection
- Set `USE_MOCK_AI=true` for instant response during testing

## Next Steps

1. Implement habit tracking screen to update habit progress
2. Add `/habits/plan/:planId` endpoint to retrieve saved plans
3. Implement analytics to track habit completion rates
4. Add push notifications for habit reminders (requires additional backend implementation)
