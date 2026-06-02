import useAuthStore from '../../src/store/useAuthStore';
import client from '../../src/api/client';
import { storage } from '../../src/utils/storage';

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('../../src/utils/storage', () => ({
  storage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isBootstrapping: true,
      error: null,
    });
  });

  it('stores user state after login', async () => {
    client.post.mockResolvedValue({
      data: {
        metadata: {
          user: { id: 'user-1', email: 'test@example.com' },
          tokens: { accessToken: 'access-token' },
        },
      },
    });

    await useAuthStore.getState().login('test@example.com', 'password123');

    expect(client.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(storage.setItem).toHaveBeenCalledWith('userToken', 'access-token');
    expect(useAuthStore.getState().user).toEqual({ id: 'user-1', email: 'test@example.com' });
    expect(useAuthStore.getState().token).toBe('access-token');
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });

  it('restores the user session from storage', async () => {
    storage.getItem.mockResolvedValue('stored-token');
    client.get.mockResolvedValue({
      data: { id: 'user-2', email: 'restore@example.com' },
    });

    await useAuthStore.getState().restoreToken();

    expect(storage.getItem).toHaveBeenCalledWith('userToken');
    expect(client.get).toHaveBeenCalledWith('/auth/profile');
    expect(useAuthStore.getState().user).toEqual({ id: 'user-2', email: 'restore@example.com' });
    expect(useAuthStore.getState().token).toBe('stored-token');
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });

  it('logs out through the API and clears local auth state', async () => {
    client.post.mockResolvedValue({
      data: { message: 'Logout success!' },
    });
    useAuthStore.setState({
      user: { id: 'user-3' },
      token: 'access-token',
      isLoading: false,
      isBootstrapping: false,
      error: null,
    });

    await useAuthStore.getState().logout();

    expect(client.post).toHaveBeenCalledWith('/auth/logout');
    expect(storage.deleteItem).toHaveBeenCalledWith('userToken');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });
});