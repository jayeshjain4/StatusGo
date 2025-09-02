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

// Extended Prisma client type
export interface ExtendedPrismaClient extends PrismaClient {
  userPreference: {
    findMany: (args?: any) => Promise<UserPreference[]>;
    findUnique: (args: any) => Promise<UserPreference | null>;
    create: (args: any) => Promise<UserPreference>;
    createMany: (args: any) => Promise<any>;
    update: (args: any) => Promise<UserPreference>;
    delete: (args: any) => Promise<UserPreference>;
    deleteMany: (args?: any) => Promise<any>;
    count: (args?: any) => Promise<number>;
  };
}
