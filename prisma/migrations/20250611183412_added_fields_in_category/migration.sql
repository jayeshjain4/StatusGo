-- AlterTable
ALTER TABLE "category" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0;
