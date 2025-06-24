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
import cloudinary from '../utils/cloudinary';
import fs from 'fs';
// import { validateRequest } from '../middlewares/validateRequest';

// Initialize Prisma client once
const prisma = new PrismaClient();

// Type for signup request body
interface SignupBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

// Type for login request body
interface LoginBody {
  email: string;
  password: string;
}

// Type for update profile request body
interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

// Signup validation schema
const signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  password: Joi.string().min(6).required()
});

// Update profile validation schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).optional(),
  lastName: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().min(6).optional()
}).min(1); // At least one field must be provided

export const signup = async (req: Request<{}, {}, SignupBody>, res: Response) => {
  // Debug log to help diagnose multer/body issues
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate request body against the schema
    const { error } = signupSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, STATUS_CODES.BAD_REQUEST);
    }    // Check if user already exists - handle optional phone
    const whereClause: any = { email };
    if (phone) {
      whereClause.OR = [{ email }, { phone }];
    }
    
    const existingUser = await prisma.user.findFirst({
      where: whereClause
    });

    if (existingUser) {
      throw new AppError('User with this email or phone number already exists', STATUS_CODES.CONFLICT);
    }

    // Handle profile image upload
    let profileImageUrl: string | undefined = undefined;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'user-profiles',
      });
      profileImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path); // Remove local file
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);    // Create user with optional fields
    const userData: any = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };
    
    // Add optional fields if they exist
    if (phone) userData.phone = phone;
    if (profileImageUrl) userData.profileImage = profileImageUrl;
    
    const user = await prisma.user.create({
      data: userData
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
          phone: user.phone,
          profileImage: user.profileImage,
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
    const { email, password } = req.body;
    
    // Find user by email only
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid login credentials', STATUS_CODES.UNAUTHORIZED);
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new AppError('Account has been deleted', STATUS_CODES.UNAUTHORIZED);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);    if (!isValidPassword) {
      throw new AppError('Invalid credentials', STATUS_CODES.UNAUTHORIZED);
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

// GET /api/auth/profile - Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true
      }
    });

    if (!user) {
      return sendResponse(res, false, null, 'User not found', STATUS_CODES.NOT_FOUND);
    }

    if (user.isDeleted) {
      return sendResponse(res, false, null, 'Account has been deleted', STATUS_CODES.UNAUTHORIZED);
    }

    // Remove isDeleted from response
    const { isDeleted, ...userResponse } = user;

    return sendResponse(res, true, userResponse, 'User profile fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return sendResponse(res, false, null, 'Internal server error', STATUS_CODES.SERVER_ERROR);
  }
};

// PUT /api/auth/profile - Update user profile
export const updateUserProfile = async (req: Request<{}, {}, UpdateProfileBody>, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
    }

    // Validate request body
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return sendResponse(res, false, error.details, error.details[0].message, STATUS_CODES.BAD_REQUEST);
    }

    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return sendResponse(res, false, null, 'User not found', STATUS_CODES.NOT_FOUND);
    }

    if (existingUser.isDeleted) {
      return sendResponse(res, false, null, 'Account has been deleted', STATUS_CODES.UNAUTHORIZED);
    }

    // Check for email uniqueness if email is being updated
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        return sendResponse(res, false, null, 'Email already exists', STATUS_CODES.CONFLICT);
      }
    }

    // Check for phone uniqueness if phone is being updated
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone }
      });
      if (phoneExists) {
        return sendResponse(res, false, null, 'Phone number already exists', STATUS_CODES.CONFLICT);
      }
    }

    // Handle profile image upload if present
    let profileImageUrl: string | undefined = undefined;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'user-profiles',
      });
      profileImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path); // Remove local file
    }

    // Prepare update data
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (profileImageUrl) updateData.profileImage = profileImageUrl;
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        updatedAt: true
      }
    });

    return sendResponse(res, true, updatedUser, 'Profile updated successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return sendResponse(res, false, null, 'Email or phone number already exists', STATUS_CODES.CONFLICT);
      }
    }

    return sendResponse(res, false, null, 'Internal server error', STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/auth/users - Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return sendResponse(res, false, null, 'Access denied. Admins only.', STATUS_CODES.FORBIDDEN);
    }

    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Validate page and limit
    if (page < 1) {
      return sendResponse(res, false, null, 'Page number must be greater than 0', STATUS_CODES.BAD_REQUEST);
    }
    
    if (limit < 1 || limit > 100) {
      return sendResponse(res, false, null, 'Limit must be between 1 and 100', STATUS_CODES.BAD_REQUEST);
    }

    // Get total count of users (excluding deleted ones)
    const totalUsers = await prisma.user.count({
      where: { isDeleted: false }
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with pagination
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    // Prepare pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
      usersPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };

    const responseData = {
      users: users,
      pagination: pagination
    };

    return sendResponse(res, true, responseData, 'Users fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Get all users error:', error);
    return sendResponse(res, false, null, 'Internal server error', STATUS_CODES.SERVER_ERROR);
  }
};

const router = Router();
