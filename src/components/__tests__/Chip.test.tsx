import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Chip } from '../Chip';

describe('Chip', () => {
  it('should render with label', () => {
    const { getByText } = render(
      <Chip label="Sleep" selected={false} onPress={() => {}} />
    );
    expect(getByText('Sleep')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Chip label="Sleep" selected={false} onPress={onPress} />);

    fireEvent.press(getByText('Sleep'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should render selected state', () => {
    const { getByText } = render(
      <Chip label="Sleep" selected={true} onPress={() => {}} />
    );
    expect(getByText('Sleep')).toBeTruthy();
  });

  it('should render remove button when selected and onRemove provided', () => {
    const onRemove = jest.fn();
    const { getByText } = render(
      <Chip label="Sleep" selected={true} onPress={() => {}} onRemove={onRemove} />
    );
    expect(getByText('×')).toBeTruthy();
  });

  it('should call onRemove when remove button pressed', () => {
    const onRemove = jest.fn();
    const { getByText } = render(
      <Chip label="Sleep" selected={true} onPress={() => {}} onRemove={onRemove} />
    );

    fireEvent.press(getByText('×'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should not render remove button when not selected', () => {
    const onRemove = jest.fn();
    const { queryByText } = render(
      <Chip label="Sleep" selected={false} onPress={() => {}} onRemove={onRemove} />
    );
    expect(queryByText('×')).toBeNull();
  });

  it('should not render remove button when onRemove not provided', () => {
    const { queryByText } = render(
      <Chip label="Sleep" selected={true} onPress={() => {}} />
    );
    expect(queryByText('×')).toBeNull();
  });
});
