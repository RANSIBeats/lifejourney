import axios from 'axios';
import { OnboardingPayload, HabitLayers } from '../types/onboarding';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

export const generateHabits = async (payload: OnboardingPayload): Promise<HabitLayers> => {
  // Stubbed implementation - replace with actual API call
  // Simulating network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Stubbed response based on the payload
  const mockHabits: HabitLayers = {
    foundational: [
      {
        id: 'f1',
        title: '7-8 Hours Sleep',
        description: 'Maintain a consistent sleep schedule for optimal performance',
        frequency: 'Daily',
      },
      {
        id: 'f2',
        title: 'Morning Hydration',
        description: 'Drink a glass of water first thing in the morning',
        frequency: 'Daily',
      },
      {
        id: 'f3',
        title: '10-Minute Walk',
        description: 'Take a short walk to boost energy and clarity',
        frequency: 'Daily',
      },
    ],
    goalSpecific: [
      {
        id: 'g1',
        title: `${payload.goal} - Daily Action`,
        description: `Take one specific action toward your goal: ${payload.goal}`,
        frequency: 'Daily',
      },
      {
        id: 'g2',
        title: 'Progress Review',
        description: 'Spend 5 minutes reviewing your progress',
        frequency: 'Weekly',
      },
    ],
    barrierTargeting: payload.barriers.map((barrier, index) => ({
      id: `b${index + 1}`,
      title: `Address ${barrier}`,
      description: `Specific strategy to overcome ${barrier.toLowerCase()} challenges`,
      frequency: 'As needed',
    })),
  };

  // Uncomment below for actual API integration
  /*
  try {
    const response = await axios.post(`${API_BASE_URL}/habits/generate`, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to generate habits');
    }
    throw error;
  }
  */

  return mockHabits;
};

export const submitOnboarding = async (payload: OnboardingPayload): Promise<void> => {
  // Stubbed implementation - replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Uncomment below for actual API integration
  /*
  try {
    await axios.post(`${API_BASE_URL}/onboarding/complete`, payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to submit onboarding');
    }
    throw error;
  }
  */
};
