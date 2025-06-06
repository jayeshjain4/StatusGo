import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    sendResponse(
      res,
      false,
      err.errors,
      'Validation failed',
      STATUS_CODES.BAD_REQUEST
    );
    return;
  }

  if (err instanceof AppError) {
    sendResponse(
      res,
      false,
      null,
      err.message,
      err.statusCode
    );
    return;
  }

  // Default error
  sendResponse(
    res,
    false,
    null,
    'Internal server error',
    STATUS_CODES.SERVER_ERROR
  );
};

