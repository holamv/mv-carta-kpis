import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { message: 'Recurso no encontrado', code: 'NOT_FOUND' },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      ...(env.NODE_ENV === 'development' && err instanceof Error
        ? { details: err.message }
        : {}),
    },
  });
}
