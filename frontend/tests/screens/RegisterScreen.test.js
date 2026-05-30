import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';
import useAuthStore from '../../src/store/useAuthStore';

jest.mock('../../src/store/useAuthStore');

describe('RegisterScreen', () => {
  const mockRegister = jest.fn();
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    useAuthStore.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
    });
    mockRegister.mockClear();
    mockNavigation.navigate.mockClear();
  });

  it('navigates through steps and registers', () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    // Step 1: Username
    expect(getByText('Choose a username')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('e.g. ielts_warrior'), 'newuser');
    fireEvent.press(getByText('Continue'));

    // Step 2: Email and Password
    expect(getByText('Secure account')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('At least 6 characters'), 'password123');
    // Using getAllByText since there might be multiple "Continue" elements in DOM depending on render, 
    // but React Native unmounts conditional rendering. So getByText('Continue') should work.
    fireEvent.press(getByText('Continue'));

    // Step 3: Full Name
    expect(getByText("What's your name?")).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'Test User');
    fireEvent.press(getByText('Register'));

    expect(mockRegister).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    });
  });

  it('shows validation error if email is invalid', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    // Step 1
    fireEvent.changeText(getByPlaceholderText('e.g. ielts_warrior'), 'newuser');
    fireEvent.press(getByText('Continue'));

    // Step 2 with invalid email
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'invalid-email');
    fireEvent.press(getByText('Continue'));

    expect(getByText('Please enter a valid email address.')).toBeTruthy();
  });

  it('navigates to Login screen when Log in is pressed', () => {
    const { getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Log in'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
});
