import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import STATUS_CODES from '../utils/statusCodes';
import { validateCategoryScheme, validateUpdateCategoryScheme } from '../validators/categoryValidate';
import { sendResponse } from '../utils/responseUtils';

const prisma = new PrismaClient();

// 1. Create Category Via Admin

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    const { error } = validateCategoryScheme(req.body);
    if (error) {
        sendResponse(res, false, error, error.details[0].message, STATUS_CODES.BAD_REQUEST);
        return;
    }
    try {
        const user = req.user;

        const { name, imageUrl } = req.body;
        
        const existing = await prisma.category.findUnique({
            where: { name },
        });
        
        if (existing) {
            sendResponse(res, false, null, 'Category already exists', STATUS_CODES.CONFLICT);
            return;
        }

        const data: any = {
            name,
            createdById: user?.id,
        };

        if (imageUrl) {
            data.imageUrl = imageUrl;
        }

        const newCategory = await prisma.category.create({data});

        sendResponse(res, true, newCategory, 'New Category created successfully', STATUS_CODES.CREATED);

    } catch (error: any) {
        sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
    }
}

// 2. Edit Category
export const editCategoryById = async (req: Request, res: Response): Promise<void> => {
    const categoryId = parseInt(req.params.id); // assumes /category/:id route
    if (isNaN(categoryId)) {
      sendResponse(res, false, null, 'Invalid category ID', STATUS_CODES.BAD_REQUEST);
      return;
    }
  
    const { error } = validateUpdateCategoryScheme(req.body);
    if (error) {
      sendResponse(res, false, error, error.details[0].message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    try {

        const {name, imageUrl} = req.body;

        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId}
        })

        if(!existingCategory){
            sendResponse(res, false, null, 'Category not found', STATUS_CODES.NOT_FOUND);
            return;
        }

        if (name && name !== existingCategory.name) {
            const duplicate = await prisma.category.findUnique({ where: { name } });
            if (duplicate) {
              sendResponse(res, false, null, 'Another category with this name already exists', STATUS_CODES.CONFLICT);
              return;
            }
        }

        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: {
                ...(name && {name}),
                ...(imageUrl !== undefined && { imageUrl }),
                updatedAt: new Date(),
            },
        });

        sendResponse(res,true,updatedCategory, 'Category updated successfully', STATUS_CODES.OK);


    } catch (error: any) {
        sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
    }
}

// 3. Delete Category
export const deleteCategoryById = async (req:Request, res: Response): Promise<void> => {

    const categoryId = parseInt(req.params.id);

    if(isNaN(categoryId)) {
        sendResponse(res, false, null, 'Invalid category ID', STATUS_CODES.BAD_REQUEST);
        return;
    }

    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    })

    if (!category) {
        sendResponse(res, false, null, 'Category not found', STATUS_CODES.NOT_FOUND);
        return;
    }

    if(category.isDeleted) {
        sendResponse(res, false, null, 'Category already deleted', STATUS_CODES.BAD_REQUEST);
        return;
    }

    const deletedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
            isDeleted: true,
        }
    });

    sendResponse(res, true, deletedCategory, 'Category deleted successfully', STATUS_CODES.OK);

    try {

    } catch (error: any) {
        sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
    }
}


// 4. Get All Categories
export const getAllCateogories = async (req: Request, res: Response): Promise<void> => {
    try {

      const getAllCateogories = await prisma.category.findMany({
        where: {
            isDeleted: false,
        },
        orderBy: {
            createdAt: 'desc',
        }
      });
      
      sendResponse(res,true,getAllCateogories, 'All categories fetched successfully', STATUS_CODES.OK);

    } catch (error: any) {
        sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
    }
}