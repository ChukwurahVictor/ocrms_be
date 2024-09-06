-- AlterTable
ALTER TABLE "users" ADD COLUMN     "staffId" VARCHAR;

-- AddForeignKey
ALTER TABLE "complaint_history" ADD CONSTRAINT "complaint_history_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
