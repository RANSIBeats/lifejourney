import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
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

describe('LoginScreen', () => {
  const mockSignIn = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signIn: mockSignIn,
        isLoading: false,
        error: null,
        setError: mockSetError,
      };
      return selector(state);
    });
  });

  it('should render correctly', () => {
    const { toJSON } = render(<LoginScreen navigation={mockNavigation as any} route={{} as any} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render loading state correctly', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signIn: mockSignIn,
        isLoading: true,
        error: null,
        setError: mockSetError,
      };
      return selector(state);
    });

    const { toJSON, getByTestId } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render error state correctly', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signIn: mockSignIn,
        isLoading: false,
        error: 'Invalid credentials',
        setError: mockSetError,
      };
      return selector(state);
    });

    const { toJSON, getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Invalid credentials')).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it('should handle login button press', async () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error when fields are empty', async () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const loginButton = getByText('Sign In');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Please fill in all fields');
    });
  });

  it('should disable inputs and button when loading', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signIn: mockSignIn,
        isLoading: true,
        error: null,
        setError: mockSetError,
      };
      return selector(state);
    });

    const { getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    expect(emailInput.props.editable).toBe(false);
    expect(passwordInput.props.editable).toBe(false);
  });

  it('should navigate to forgot password screen', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const forgotPasswordLink = getByText('Forgot password?');
    fireEvent.press(forgotPasswordLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('should navigate to register screen', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const registerLink = getByText('Sign up');
    fireEvent.press(registerLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });
});
