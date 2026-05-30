import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import useAuthStore from '../../src/store/useAuthStore';

// Mock the store
jest.mock('../../src/store/useAuthStore');

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    useAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
    mockLogin.mockClear();
    mockNavigation.navigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} />);
    
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByPlaceholderText('name@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('calls login with email and password when Continue is pressed', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    
    fireEvent.press(getByText('Continue'));
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('navigates to Register screen when Create account is pressed', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Create account'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('displays error message when error exists in store', () => {
    useAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
    });

    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    expect(getByText('Invalid credentials')).toBeTruthy();
  });
});
