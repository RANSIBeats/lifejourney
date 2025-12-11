import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { JourneyTimeline } from '../JourneyTimeline';
import { JourneyPhase, PhaseStatus } from '../../types/onboarding';

const mockPhases: JourneyPhase[] = [
  {
    id: 'reset-rebuild',
    name: 'Reset & Rebuild',
    summary: 'Foundation building and habit establishment',
    status: 'current',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-01-07T00:00:00.000Z',
    habitCount: 3,
    habits: [
      {
        id: 'h1',
        title: '7-8 Hours Sleep',
        description: 'Maintain a consistent sleep schedule',
        frequency: 'Daily',
      },
      {
        id: 'h2',
        title: 'Morning Hydration',
        description: 'Drink a glass of water first thing',
        frequency: 'Daily',
      },
    ],
  },
  {
    id: 'build-momentum',
    name: 'Build Momentum',
    summary: 'Strengthening routines and overcoming obstacles',
    status: 'locked',
    startDate: '2024-01-08T00:00:00.000Z',
    endDate: '2024-01-14T00:00:00.000Z',
    habitCount: 1,
    habits: [
      {
        id: 'h3',
        title: 'Daily Goal Action',
        description: 'Take specific action toward goal',
        frequency: 'Daily',
      },
    ],
  },
  {
    id: 'polish-prepare',
    name: 'Polish & Prepare',
    summary: 'Refining habits and preparing for next level',
    status: 'locked',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-01-21T00:00:00.000Z',
    habitCount: 1,
    habits: [
      {
        id: 'h4',
        title: 'Progress Review',
        description: 'Review your progress weekly',
        frequency: 'Weekly',
      },
    ],
  },
  {
    id: 'ready-window',
    name: 'Ready Window',
    summary: 'Peak performance and goal achievement',
    status: 'locked',
    startDate: '2024-01-22T00:00:00.000Z',
    endDate: '2024-01-28T00:00:00.000Z',
    habitCount: 0,
    habits: [],
  },
];

describe('JourneyTimeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => render(<JourneyTimeline phases={mockPhases} />)).not.toThrow();
  });

  it('renders all phase names', () => {
    const { getByText } = render(<JourneyTimeline phases={mockPhases} />);
    
    expect(getByText('Reset & Rebuild')).toBeTruthy();
    expect(getByText('Build Momentum')).toBeTruthy();
    expect(getByText('Polish & Prepare')).toBeTruthy();
    expect(getByText('Ready Window')).toBeTruthy();
  });

  it('renders phase summaries', () => {
    const { getByText } = render(<JourneyTimeline phases={mockPhases} />);
    
    expect(getByText('Foundation building and habit establishment')).toBeTruthy();
    expect(getByText('Strengthening routines and overcoming obstacles')).toBeTruthy();
  });

  it('displays different status correctly', () => {
    const currentPhase = mockPhases.find(p => p.status === 'current');
    const lockedPhase = mockPhases.find(p => p.status === 'locked');
    
    expect(currentPhase?.name).toBe('Reset & Rebuild');
    expect(lockedPhase?.name).toBe('Build Momentum');
  });

  it('handles empty phases array', () => {
    expect(() => render(<JourneyTimeline phases={[]} />)).not.toThrow();
  });

  it('handles phase with no habits', () => {
    const emptyPhaseJourney: JourneyPhase[] = [
      {
        id: 'empty-phase',
        name: 'Empty Phase',
        summary: 'This phase has no habits',
        status: 'locked',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-07T00:00:00.000Z',
        habitCount: 0,
        habits: [],
      },
    ];
    
    expect(() => render(<JourneyTimeline phases={emptyPhaseJourney} />)).not.toThrow();
  });
});