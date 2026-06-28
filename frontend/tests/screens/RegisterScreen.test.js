import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';
import client from '../../src/api/client';

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

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe('RegisterScreen', () => {
  const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => {
    client.post.mockClear();
    mockNavigation.navigate.mockClear();
    mockNavigation.goBack.mockClear();
  });

  it('renders fields correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    expect(getByText('Tạo tài khoản')).toBeTruthy();
    expect(getByPlaceholderText('Nhập tên người dùng')).toBeTruthy();
    expect(getByPlaceholderText('0912345678')).toBeTruthy();
    expect(getByPlaceholderText('example@domain.com')).toBeTruthy();
    expect(getByPlaceholderText('Tạo mật khẩu mạnh')).toBeTruthy();
    expect(getByPlaceholderText('Nhập lại mật khẩu')).toBeTruthy();
  });

  it('performs registration and navigates to Login on success', async () => {
    client.post.mockResolvedValue({
      data: {
        metadata: {
          user: { id: 'user-1', username: 'ielts_warrior' },
          tokens: { accessToken: 'token' }
        }
      }
    });

    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Nhập tên người dùng'), 'Nguyen Van A');
    fireEvent.changeText(getByPlaceholderText('0912345678'), '0912345678');
    fireEvent.changeText(getByPlaceholderText('example@domain.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Tạo mật khẩu mạnh'), 'Password123!');
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu'), 'Password123!');

    fireEvent.press(getByText('Đăng ký ngay'));

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith('/auth/signup', {
        username: 'Nguyen Van A',
        phone: '0912345678',
        email: 'test@example.com',
        password: 'Password123!',
      }, { hideToast: true });
    });
  });

  it('shows error if password and confirm password do not match', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Tạo mật khẩu mạnh'), 'Password123!');
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu'), 'DifferentPwd123!');

    fireEvent.press(getByText('Đăng ký ngay'));

    expect(getByText('❌ Mật khẩu xác nhận không trùng khớp.')).toBeTruthy();
  });

  it('navigates to Login screen when Đăng nhập is pressed', () => {
    const { getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Đăng nhập'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
});
