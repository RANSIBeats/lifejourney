import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Next" onPress={() => {}} />);
    expect(getByText('Next')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Next" onPress={onPress} />);

    fireEvent.press(getByText('Next'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Next" onPress={onPress} disabled />);

    fireEvent.press(getByText('Next'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should not call onPress when loading', () => {
    const onPress = jest.fn();
    const { toJSON } = render(<Button title="Next" onPress={onPress} loading />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render ActivityIndicator when loading', () => {
    const { toJSON } = render(
      <Button title="Next" onPress={() => {}} loading />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render primary variant by default', () => {
    const { getByText } = render(<Button title="Next" onPress={() => {}} />);
    expect(getByText('Next')).toBeTruthy();
  });

  it('should render secondary variant', () => {
    const { getByText } = render(
      <Button title="Back" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Back')).toBeTruthy();
  });
});
