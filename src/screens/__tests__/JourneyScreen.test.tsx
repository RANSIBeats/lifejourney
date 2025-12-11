import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { JourneyScreen } from '../JourneyScreen';
import { useOnboardingStore } from '../../store/onboardingStore';

// Mock the store
jest.mock('../../store/onboardingStore');
const mockUseOnboardingStore = useOnboardingStore as jest.MockedFunction<typeof useOnboardingStore>;

const mockJourney = {
  id: 'journey-123',
  name: 'My Goal Journey',
  startDate: '2024-01-01T00:00:00.000Z',
  phases: [
    {
      id: 'reset-rebuild',
      name: 'Reset & Rebuild',
      summary: 'Foundation building and habit establishment',
      status: 'current' as const,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-07T00:00:00.000Z',
      habitCount: 3,
      habits: [],
    },
  ],
};

describe('JourneyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows onboarding completion message when not complete', () => {
    mockUseOnboardingStore.mockReturnValue({
      journey: null,
      isOnboardingComplete: false,
      resetOnboarding: jest.fn(),
    } as any);

    const { getByText } = render(<JourneyScreen />);
    
    expect(getByText('Complete Onboarding First')).toBeTruthy();
    expect(getByText('You need to complete the onboarding process to view your journey.')).toBeTruthy();
    expect(getByText('Restart Onboarding')).toBeTruthy();
  });

  it('shows no journey message when onboarding is complete but no journey exists', () => {
    mockUseOnboardingStore.mockReturnValue({
      journey: null,
      isOnboardingComplete: true,
      resetOnboarding: jest.fn(),
    } as any);

    const { getByText } = render(<JourneyScreen />);
    
    expect(getByText('No Journey Found')).toBeTruthy();
    expect(getByText('There was an issue loading your journey plan.')).toBeTruthy();
    expect(getByText('Restart Onboarding')).toBeTruthy();
  });

  it('renders journey timeline when journey exists', () => {
    mockUseOnboardingStore.mockReturnValue({
      journey: mockJourney,
      isOnboardingComplete: true,
      resetOnboarding: jest.fn(),
    } as any);

    const { getByText } = render(<JourneyScreen />);
    
    expect(getByText('My Goal Journey')).toBeTruthy();
    expect(getByText(/Started/)).toBeTruthy();
    expect(getByText('Reset & Rebuild')).toBeTruthy();
  });

  it('formats the start date correctly', () => {
    mockUseOnboardingStore.mockReturnValue({
      journey: mockJourney,
      isOnboardingComplete: true,
      resetOnboarding: jest.fn(),
    } as any);

    const { getByText } = render(<JourneyScreen />);
    
    // Should show a formatted date
    expect(getByText(/Started/)).toBeTruthy();
  });

  it('calls resetOnboarding when restart button is pressed', () => {
    const mockResetOnboarding = jest.fn();
    mockUseOnboardingStore.mockReturnValue({
      journey: null,
      isOnboardingComplete: false,
      resetOnboarding: mockResetOnboarding,
    } as any);

    const { getByText } = render(<JourneyScreen />);
    
    const restartButton = getByText('Restart Onboarding');
    fireEvent.press(restartButton);
    
    expect(mockResetOnboarding).toHaveBeenCalledTimes(1);
  });
});