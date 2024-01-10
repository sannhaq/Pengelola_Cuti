-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVE', 'WAITING', 'REJECT');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeOfEmployee" (
    "id" SERIAL NOT NULL,
    "isContract" BOOLEAN NOT NULL,
    "startContract" DATE NOT NULL,
    "endContract" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeOfEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Positions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "nik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startWorking" DATE NOT NULL,
    "isWorking" BOOLEAN NOT NULL,
    "positionId" INTEGER NOT NULL,
    "historicalName" TEXT NOT NULL,
    "historicalNik" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "typeOfEmployeeId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("nik")
);

-- CreateTable
CREATE TABLE "TypeOfLeave" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeOfLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmountOfLeave" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "AmountOfLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leave" (
    "id" SERIAL NOT NULL,
    "typeOfLeaveId" INTEGER NOT NULL,
    "startLeave" DATE NOT NULL,
    "endLeave" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "amountOfLeaveId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'WAITING',
    "employeeNik" TEXT NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToken" (
    "id" SERIAL NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_refreshToken_key" ON "UserToken"("refreshToken");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_typeOfEmployeeId_fkey" FOREIGN KEY ("typeOfEmployeeId") REFERENCES "TypeOfEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_typeOfLeaveId_fkey" FOREIGN KEY ("typeOfLeaveId") REFERENCES "TypeOfLeave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_amountOfLeaveId_fkey" FOREIGN KEY ("amountOfLeaveId") REFERENCES "AmountOfLeave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_employeeNik_fkey" FOREIGN KEY ("employeeNik") REFERENCES "Employee"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;