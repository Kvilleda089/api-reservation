-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMINISTRATOR', 'ADMINISTRATOR', 'COURT_MANAGER', 'CLEANING_STAFF', 'RECEPTIONIST');

-- CreateEnum
CREATE TYPE "ReservationResource" AS ENUM ('CANCHA_1', 'CANCHA_2', 'SALON');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA');

-- CreateTable
CREATE TABLE "employee" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(150) NOT NULL,
    "middleName" VARCHAR(150) NOT NULL,
    "surname" VARCHAR(150) NOT NULL,
    "secondSurname" VARCHAR(150) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "hireDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(150) NOT NULL,
    "middleName" VARCHAR(150),
    "surname" VARCHAR(150),
    "secondSurname" VARCHAR(150),
    "email" VARCHAR(100),
    "phoneNumber" VARCHAR(8),
    "dateRegistration" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "reservationResource" "ReservationResource" NOT NULL,
    "hour" TIME(0) NOT NULL,
    "totalReservation" DECIMAL(10,2) NOT NULL,
    "reservedHours" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "reservationDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_deposit" (
    "id" UUID NOT NULL,
    "reservationId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_deposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employee_username_key" ON "employee"("username");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_deposit" ADD CONSTRAINT "reservation_deposit_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
