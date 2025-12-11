import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import { useAuthStore } from '@store/authStore';

jest.mock('@store/authStore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('RegisterScreen', () => {
  const mockSignUp = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signUp: mockSignUp,
        isLoading: false,
        error: null,
        setError: mockSetError,
      };
      return selector(state);
    });
  });

  it('should render correctly', () => {
    const { toJSON } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render loading state correctly', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signUp: mockSignUp,
        isLoading: true,
        error: null,
        setError: mockSetError,
      };
      return selector(state);
    });

    const { toJSON } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render error state correctly', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signUp: mockSignUp,
        isLoading: false,
        error: 'Email already exists',
        setError: mockSetError,
      };
      return selector(state);
    });

    const { toJSON, getByText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Email already exists')).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it('should handle registration button press', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    const registerButton = getByTestId('register-button');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });
  });

  it('should show error when fields are empty', async () => {
    const { getByTestId } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const registerButton = getByTestId('register-button');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Please fill in all fields');
    });
  });

  it('should show error when passwords do not match', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'different123');

    const registerButton = getByTestId('register-button');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Passwords do not match');
    });
  });

  it('should show error when password is too short', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '12345');
    fireEvent.changeText(confirmPasswordInput, '12345');

    const registerButton = getByTestId('register-button');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Password must be at least 6 characters');
    });
  });

  it('should disable inputs and button when loading', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signUp: mockSignUp,
        isLoading: true,
        error: null,
        setError: mockSetError,
      };
      return selector(state);
    });

    const { getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    expect(nameInput.props.editable).toBe(false);
    expect(emailInput.props.editable).toBe(false);
    expect(passwordInput.props.editable).toBe(false);
    expect(confirmPasswordInput.props.editable).toBe(false);
  });

  it('should navigate to login screen', () => {
    const { getByText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const loginLink = getByText('Sign in');
    fireEvent.press(loginLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
});
