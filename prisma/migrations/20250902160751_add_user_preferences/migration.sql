-- AlterTable
ALTER TABLE "user" ADD COLUMN     "hasSetPreferences" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "userPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userPreference_userId_idx" ON "userPreference"("userId");

-- CreateIndex
CREATE INDEX "userPreference_categoryId_idx" ON "userPreference"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "userPreference_userId_categoryId_key" ON "userPreference"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "userPreference" ADD CONSTRAINT "userPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userPreference" ADD CONSTRAINT "userPreference_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
