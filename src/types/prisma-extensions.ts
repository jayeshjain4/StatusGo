// Extended types for Prisma models
import { PrismaClient, Prisma } from '@prisma/client';

// Extended user type that includes hasSetPreferences
export type UserWithPreferences = Prisma.userGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    phone: true;
    password: true;
    isDeleted: true;
    hasSetPreferences: true;
  }
}>;

// UserPreference type
export type UserPreference = {
  id: number;
  userId: number;
  categoryId: number;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  category?: any;
};

// Type for Prisma client with userPreference access
export type ExtendedPrismaClient = PrismaClient & {
  userPreference?: any;
};
