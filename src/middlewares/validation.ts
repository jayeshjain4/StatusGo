import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters')
}).passthrough();

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
}).passthrough();

export const validateSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(
        res,
        false,
        {
          _original: req.body,
          details: error.errors
        },
        'Validation failed',
        STATUS_CODES.BAD_REQUEST
      );
    }
    next(error);
  }
};

export const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(
        res,
        false,
        {
          _original: req.body,
          details: error.errors
        },
        'Validation failed',
        STATUS_CODES.BAD_REQUEST
      );
    }
    next(error);
  }
}; 