-- AlterTable
ALTER TABLE "post" ADD COLUMN     "categoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
