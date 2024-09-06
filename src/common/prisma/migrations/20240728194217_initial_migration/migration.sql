-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('Admin', 'User', 'Staff');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('Pending', 'In_progress', 'Resolved', 'Closed', 'Escalated', 'Draft', 'Archived');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('Very_Poor', 'Poor', 'Average', 'Good', 'Very_Good');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "middleName" VARCHAR,
    "lastName" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(14),
    "gender" "Gender",
    "profileImgUrl" VARCHAR,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "userRole" "UserRoles" NOT NULL DEFAULT 'User',
    "dateOfBirth" VARCHAR,
    "departmentId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ComplaintStatus" NOT NULL,
    "imageId" UUID,
    "priorityLevel" "PriorityLevel" DEFAULT 'Low',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" "Rating",
    "estimatedResolutionTime" TEXT,
    "resolutionTime" TEXT,
    "departmentId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_history" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "updatedStatus" "ComplaintStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR,
    "updatedBy" VARCHAR NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "complaint_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" VARCHAR,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint-images" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "complaint-images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL,
    "comment" TEXT NOT NULL,
    "complaintId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" "Rating",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_referenceNo_key" ON "complaints"("referenceNo");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint-images" ADD CONSTRAINT "complaint-images_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
