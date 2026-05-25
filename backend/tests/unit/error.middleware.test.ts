// Unit test for Global Error Middleware
// Validates architecture's required API response format: { success: false, error: { code, message } }
import { ApiError } from '../../src/middlewares/error.middleware';

describe('ApiError class', () => {
  it('should create error with correct statusCode and status', () => {
    const error = new ApiError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('should default to 500 statusCode when not provided', () => {
    const error = new ApiError('Server error');

    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
  });

  it('should have status="fail" for 4xx errors', () => {
    const error404 = new ApiError('Not found', 404);
    const error422 = new ApiError('Validation error', 422);

    expect(error404.status).toBe('fail');
    expect(error422.status).toBe('fail');
  });

  it('should have status="error" for 5xx errors', () => {
    const error500 = new ApiError('Internal error', 500);
    const error503 = new ApiError('Service unavailable', 503);

    expect(error500.status).toBe('error');
    expect(error503.status).toBe('error');
  });
});
