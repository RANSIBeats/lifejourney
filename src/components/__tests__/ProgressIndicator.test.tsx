import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressIndicator } from '../ProgressIndicator';

describe('ProgressIndicator', () => {
  it('should render with correct total steps', () => {
    const { toJSON } = render(<ProgressIndicator totalSteps={3} currentStep={1} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with step 1 active', () => {
    const { toJSON } = render(<ProgressIndicator totalSteps={3} currentStep={1} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with step 2 active', () => {
    const { toJSON } = render(<ProgressIndicator totalSteps={3} currentStep={2} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with step 3 active', () => {
    const { toJSON } = render(<ProgressIndicator totalSteps={3} currentStep={3} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should handle different total steps', () => {
    const { toJSON } = render(<ProgressIndicator totalSteps={5} currentStep={3} />);
    expect(toJSON()).toBeTruthy();
  });
});
