// Shared TypeScript type definitions
// These interfaces are shared between frontend and backend conceptually
// Backend-specific types stay in their respective files

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
