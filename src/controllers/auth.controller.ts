import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';
import { AppError } from '../middlewares/errorHandler';
import Joi from 'joi';
import { Router } from 'express';
// import { validateRequest } from '../middlewares/validateRequest';

// Initialize Prisma client once
const prisma = new PrismaClient();

// Type for signup request body
interface SignupBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

// Type for login request body
interface LoginBody {
  phone: string;
  password: string;
}

// Signup validation schema
const signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(), // Add this line
  password: Joi.string().min(6).required()
});

export const signup = async (req: Request<{}, {}, SignupBody>, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate request body against the schema
    const { error } = signupSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, STATUS_CODES.BAD_REQUEST);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User with this email or phone number already exists', STATUS_CODES.CONFLICT);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return sendResponse(
      res,
      true,
      {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        },
        token
      },
      'User created successfully',
      STATUS_CODES.CREATED
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);

    if (error instanceof AppError) {
      return sendResponse(
        res,
        false,
        null,
        error.message,
        error.statusCode
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      if ((error as PrismaClientKnownRequestError).code === 'P2002') {
        return sendResponse(
          res,
          false,
          null,
          'A user with this email or phone number already exists',
          STATUS_CODES.CONFLICT
        );
      }
    }

    return sendResponse(
      res,
      false,
      null,
      'Internal server error',
      STATUS_CODES.SERVER_ERROR
    );
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      throw new AppError('Invalid phone number or password', STATUS_CODES.UNAUTHORIZED);
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new AppError('Account has been deleted', STATUS_CODES.UNAUTHORIZED);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid phone number or password', STATUS_CODES.UNAUTHORIZED);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return sendResponse(
      res,
      true,
      {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        },
        token
      },
      'Login successful',
      STATUS_CODES.OK
    );
  } catch (error: unknown) {
    console.error('Login error:', error);

    if (error instanceof AppError) {
      return sendResponse(
        res,
        false,
        null,
        error.message,
        error.statusCode
      );
    }

    return sendResponse(
      res,
      false,
      null,
      'Internal server error',
      STATUS_CODES.SERVER_ERROR
    );
  }
};