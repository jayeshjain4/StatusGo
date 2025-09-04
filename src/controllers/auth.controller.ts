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
import admin from 'firebase-admin'; // Make sure firebase-admin is initialized

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
          hasSetPreferences: false, // Default to false if field doesn't exist
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
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        isDeleted: true
      }
    });

    if (!user) {
      throw new AppError('Invalid login credentials', STATUS_CODES.UNAUTHORIZED);
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new AppError('Account has been deleted', STATUS_CODES.UNAUTHORIZED);
    }

    // Check if password is set
    if (!(user as any).password) {
      throw new AppError('Invalid credentials', STATUS_CODES.UNAUTHORIZED);
    }
    // Verify password
    const isValidPassword = await bcrypt.compare(password, (user as any).password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', STATUS_CODES.UNAUTHORIZED);
    }

    // Generate JWT tokenf
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
          id: (user as any).id,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName,
          email: (user as any).email,
          phone: (user as any).phone,
          hasSetPreferences: false // Default to false if field doesn't exist
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

// POST /api/auth/firebase-otp-login - Sync Firebase OTP user
export const syncFirebaseOtpUser = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;
    const firebaseUid = decodedToken.uid;

    if (!phoneNumber) {
      return sendResponse(res, false, null, 'Phone number not found in Firebase token.', STATUS_CODES.BAD_REQUEST);
    }

    // Check if user exists by phone
    let user = await prisma.user.findUnique({ where: { phone: phoneNumber } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: phoneNumber,
          firebaseUid: firebaseUid,
          firstName: null,
          lastName: null,
          email: null,
          password: null,
          profileImage: null,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return sendResponse(res, true, { user, token }, 'User synced successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Firebase OTP sync error:', error);
    return sendResponse(res, false, null, 'Invalid Firebase token.', STATUS_CODES.UNAUTHORIZED);
  }
};

// POST /api/auth/set-preferences - Set user category preferences
export const setUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
    }

    const { categoryIds } = req.body;
    
    // Validate categoryIds
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return sendResponse(res, false, null, 'Category IDs must be a non-empty array', STATUS_CODES.BAD_REQUEST);
    }

    // Validate that all categoryIds are numbers
    const validCategoryIds = categoryIds.filter(id => typeof id === 'number' && !isNaN(id));
    if (validCategoryIds.length !== categoryIds.length) {
      return sendResponse(res, false, null, 'All category IDs must be valid numbers', STATUS_CODES.BAD_REQUEST);
    }

    // Check if all categories exist
    const existingCategories = await prisma.category.findMany({
      where: {
        id: { in: validCategoryIds },
        isDeleted: false
      }
    });

    if (existingCategories.length !== validCategoryIds.length) {
      return sendResponse(res, false, null, 'Some category IDs are invalid or do not exist', STATUS_CODES.BAD_REQUEST);
    }

    // Remove existing preferences for this user using raw SQL
    await prisma.$executeRaw`DELETE FROM "userPreference" WHERE "userId" = ${userId}`;

    // Create new preferences using raw SQL
    for (const categoryId of validCategoryIds) {
      await prisma.$executeRaw`
        INSERT INTO "userPreference" ("userId", "categoryId", "weight", "createdAt", "updatedAt")
        VALUES (${userId}, ${categoryId}, 1.0, NOW(), NOW())
      `;
    }

    // Update user to mark that preferences have been set
    await prisma.user.update({
      where: { id: userId },
      data: { hasSetPreferences: true } as any
    });

    // Fetch the created preferences with category details using raw SQL
    const userPreferences = await prisma.$queryRaw`
      SELECT 
        up.id,
        up."userId",
        up."categoryId", 
        up.weight,
        up."createdAt",
        up."updatedAt",
        json_build_object(
          'id', c.id,
          'name', c.name,
          'imageUrl', c."imageUrl"
        ) as category
      FROM "userPreference" up
      JOIN category c ON up."categoryId" = c.id
      WHERE up."userId" = ${userId}
    `;

    return sendResponse(res, true, userPreferences, 'User preferences set successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Set preferences error:', error);
    return sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/auth/get-preferences - Get user preferences
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
    }

    const userPreferences = await prisma.$queryRaw`
      SELECT 
        up.id,
        up."userId",
        up."categoryId", 
        up.weight,
        up."createdAt",
        up."updatedAt",
        json_build_object(
          'id', c.id,
          'name', c.name,
          'imageUrl', c."imageUrl",
          'popularity', c.popularity
        ) as category
      FROM "userPreference" up
      JOIN category c ON up."categoryId" = c.id
      WHERE up."userId" = ${userId}
      ORDER BY up.weight DESC
    `;

    // Get user details to check if preferences have been set
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasSetPreferences: true } as any
    });

    const responseData = {
      hasSetPreferences: (user as any)?.hasSetPreferences || false,
      preferences: userPreferences
    };

    return sendResponse(res, true, responseData, 'User preferences fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

const router = Router();
