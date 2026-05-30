// Global Error Middleware — MUST be the last middleware in Express chain
// Architecture Rule: ALL API errors MUST pass through here for unified response format
// Response format enforced:
//   Error: { "success": false, "error": { "code": number, "message": string } }
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found handler — must be placed BEFORE global error handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
};

// Global error handler — MUST be the LAST middleware registered in app.ts
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log non-operational errors (unexpected bugs)
  if (!err.isOperational) {
    console.error('[ERROR] Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
    },
  });
};
