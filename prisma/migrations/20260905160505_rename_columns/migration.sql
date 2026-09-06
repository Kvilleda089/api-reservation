/*
  Warnings:

  - You are about to drop the column `createdAt` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `dateRegistration` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `secondSurname` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `hireDate` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `secondSurname` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservationDate` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservationResource` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservedHours` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `totalReservation` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `reservation_deposit` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `reservation_deposit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_name` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hire_date` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middle_name` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `second_surname` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_date` to the `reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_resource` to the `reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reserved_hours` to the `reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_reservation` to the `reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_id` to the `reservation_deposit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "reservation" DROP CONSTRAINT "reservation_clientId_fkey";

-- DropForeignKey
ALTER TABLE "reservation_deposit" DROP CONSTRAINT "reservation_deposit_reservationId_fkey";

-- AlterTable
ALTER TABLE "client" DROP COLUMN "createdAt",
DROP COLUMN "dateRegistration",
DROP COLUMN "firstName",
DROP COLUMN "middleName",
DROP COLUMN "phoneNumber",
DROP COLUMN "secondSurname",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_registration" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" VARCHAR(150) NOT NULL,
ADD COLUMN     "middle_name" VARCHAR(150),
ADD COLUMN     "phone_number" VARCHAR(8),
ADD COLUMN     "second_surname" VARCHAR(150),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "employee" DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "hireDate",
DROP COLUMN "middleName",
DROP COLUMN "secondSurname",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" VARCHAR(150) NOT NULL,
ADD COLUMN     "hire_date" DATE NOT NULL,
ADD COLUMN     "middle_name" VARCHAR(150) NOT NULL,
ADD COLUMN     "phone_number" VARCHAR(8),
ADD COLUMN     "second_surname" VARCHAR(150) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "reservation" DROP COLUMN "clientId",
DROP COLUMN "createdAt",
DROP COLUMN "reservationDate",
DROP COLUMN "reservationResource",
DROP COLUMN "reservedHours",
DROP COLUMN "totalReservation",
DROP COLUMN "updatedAt",
ADD COLUMN     "client_id" UUID NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reservation_date" DATE NOT NULL,
ADD COLUMN     "reservation_resource" "ReservationResource" NOT NULL,
ADD COLUMN     "reserved_hours" INTEGER NOT NULL,
ADD COLUMN     "total_reservation" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "reservation_deposit" DROP COLUMN "createdAt",
DROP COLUMN "reservationId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reservation_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "client_phone_number_key" ON "client"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "employee_phone_number_key" ON "employee"("phone_number");

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_deposit" ADD CONSTRAINT "reservation_deposit_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
