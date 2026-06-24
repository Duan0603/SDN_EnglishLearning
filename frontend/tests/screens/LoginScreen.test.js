import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import useAuthStore from '../../src/store/useAuthStore';

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialCommunityIcons: () => null,
  MaterialIcons: () => null,
  Feather: () => null,
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useIdTokenAuthRequest: () => [null, null, jest.fn()],
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('../../src/store/useAuthStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

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
    
    expect(getByText('Welcome Back 👋')).toBeTruthy();
    expect(getByPlaceholderText('Nhập email hoặc tên người dùng')).toBeTruthy();
    expect(getByPlaceholderText('Nhập mật khẩu của bạn')).toBeTruthy();
  });

  it('calls login with email and password when Đăng nhập is pressed', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Nhập email hoặc tên người dùng'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu của bạn'), 'password123');
    
    fireEvent.press(getByText('Đăng nhập'));
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('navigates to Register screen when Đăng ký ngay is pressed', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Đăng ký ngay'));
    
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
