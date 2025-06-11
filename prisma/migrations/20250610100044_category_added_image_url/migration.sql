/*
  Warnings:

  - A unique constraint covering the columns `[imageUrl]` on the table `category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageUrl` to the `category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "category" ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "category_imageUrl_key" ON "category"("imageUrl");
