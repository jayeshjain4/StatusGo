import { Request, Response } from 'express';
import prisma from '../prisma';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';

// POST /api/preferences - Set user category preferences
export const setUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const { categoryIds } = req.body;
    
    // Validate categoryIds
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      sendResponse(res, false, null, 'Category IDs must be a non-empty array', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Validate that all categoryIds are numbers and exist
    const validCategoryIds = categoryIds.filter(id => typeof id === 'number' && !isNaN(id));
    if (validCategoryIds.length !== categoryIds.length) {
      sendResponse(res, false, null, 'All category IDs must be valid numbers', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Check if all categories exist
    const existingCategories = await prisma.category.findMany({
      where: {
        id: { in: validCategoryIds },
        isDeleted: false
      }
    });

    if (existingCategories.length !== validCategoryIds.length) {
      sendResponse(res, false, null, 'Some category IDs are invalid or do not exist', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Remove existing preferences for this user
    await (prisma as any).userPreference.deleteMany({
      where: { userId }
    });

    // Create new preferences
    const preferences = validCategoryIds.map(categoryId => ({
      userId,
      categoryId,
      weight: 1.0 // Default weight
    }));

    await (prisma as any).userPreference.createMany({
      data: preferences
    });

    // Update user to mark that preferences have been set
    await prisma.user.update({
      where: { id: userId },
      data: { hasSetPreferences: true } as any
    });

    // Fetch the created preferences with category details
    const userPreferences = await (prisma as any).userPreference.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });

    sendResponse(res, true, userPreferences, 'User preferences set successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Set preferences error:', error);
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// GET /api/preferences - Get user preferences
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const userPreferences = await (prisma as any).userPreference.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            popularity: true
          }
        }
      },
      orderBy: {
        weight: 'desc'
      }
    });

    // Get user details to check if preferences have been set
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasSetPreferences: true } as any
    });

    const responseData = {
      hasSetPreferences: (user as any)?.hasSetPreferences || false,
      preferences: userPreferences
    };

    sendResponse(res, true, responseData, 'User preferences fetched successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Get preferences error:', error);
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// PUT /api/preferences/:categoryId/weight - Update preference weight for a category
export const updatePreferenceWeight = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { categoryId } = req.params;
    const { weight } = req.body;
    
    if (!userId) {
      sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
      return;
    }

    if (!categoryId || isNaN(parseInt(categoryId))) {
      sendResponse(res, false, null, 'Invalid category ID', STATUS_CODES.BAD_REQUEST);
      return;
    }

    if (typeof weight !== 'number' || weight < 0 || weight > 5) {
      sendResponse(res, false, null, 'Weight must be a number between 0 and 5', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Check if preference exists
    const existingPreference = await (prisma as any).userPreference.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: parseInt(categoryId)
        }
      }
    });

    if (!existingPreference) {
      sendResponse(res, false, null, 'Preference not found', STATUS_CODES.NOT_FOUND);
      return;
    }

    // Update weight
    const updatedPreference = await (prisma as any).userPreference.update({
      where: {
        userId_categoryId: {
          userId,
          categoryId: parseInt(categoryId)
        }
      },
      data: { weight },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });

    sendResponse(res, true, updatedPreference, 'Preference weight updated successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Update preference weight error:', error);
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};

// DELETE /api/preferences/:categoryId - Remove a category from preferences
export const removePreference = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { categoryId } = req.params;
    
    if (!userId) {
      sendResponse(res, false, null, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
      return;
    }

    if (!categoryId || isNaN(parseInt(categoryId))) {
      sendResponse(res, false, null, 'Invalid category ID', STATUS_CODES.BAD_REQUEST);
      return;
    }

    // Check if preference exists
    const existingPreference = await (prisma as any).userPreference.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: parseInt(categoryId)
        }
      }
    });

    if (!existingPreference) {
      sendResponse(res, false, null, 'Preference not found', STATUS_CODES.NOT_FOUND);
      return;
    }

    // Delete preference
    await (prisma as any).userPreference.delete({
      where: {
        userId_categoryId: {
          userId,
          categoryId: parseInt(categoryId)
        }
      }
    });

    sendResponse(res, true, null, 'Preference removed successfully', STATUS_CODES.OK);
  } catch (error: any) {
    console.error('Remove preference error:', error);
    sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
  }
};
