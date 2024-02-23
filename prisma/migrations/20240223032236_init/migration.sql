-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVE', 'WAITING', 'REJECT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "GenderSpecialLeave" AS ENUM ('L', 'P', 'LP');

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
    "isFirst" BOOLEAN NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeOfEmployee" (
    "id" SERIAL NOT NULL,
    "isContract" BOOLEAN NOT NULL,
    "startContract" DATE NOT NULL,
    "endContract" DATE,
    "newContract" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeOfEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Positions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "nik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isWorking" BOOLEAN NOT NULL,
    "positionId" INTEGER NOT NULL,
    "historicalName" TEXT NOT NULL,
    "historicalNik" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "userId" INTEGER NOT NULL,
    "typeOfEmployeeId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("nik")
);

-- CreateTable
CREATE TABLE "AmountOfLeave" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "employeeNik" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmountOfLeave_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Leave" (
    "id" SERIAL NOT NULL,
    "typeOfLeaveId" INTEGER NOT NULL,
    "startLeave" DATE NOT NULL,
    "endLeave" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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

-- CreateTable
CREATE TABLE "LeaveEmployee" (
    "id" SERIAL NOT NULL,
    "leaveId" INTEGER NOT NULL,
    "employeeNik" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'WAITING',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialLeave" (
    "id" SERIAL NOT NULL,
    "leaveTitle" TEXT NOT NULL,
    "gender" "GenderSpecialLeave" NOT NULL,
    "amount" INTEGER NOT NULL,
    "typeOfLeaveId" INTEGER NOT NULL,
    "leaveInformation" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSpecialLeave" (
    "id" SERIAL NOT NULL,
    "employeeNik" TEXT NOT NULL,
    "specialLeaveId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'WAITING',
    "startLeave" DATE NOT NULL,
    "endLeave" DATE NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSpecialLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeductedLeave" (
    "id" SERIAL NOT NULL,
    "leaveId" INTEGER NOT NULL,
    "employeeNik" TEXT NOT NULL,
    "previousYearDeduct" INTEGER,
    "currentYearDeduct" INTEGER,

    CONSTRAINT "DeductedLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailPreference" (
    "userId" INTEGER NOT NULL,
    "receiveEmail" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
ALTER TABLE "AmountOfLeave" ADD CONSTRAINT "AmountOfLeave_employeeNik_fkey" FOREIGN KEY ("employeeNik") REFERENCES "Employee"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_typeOfLeaveId_fkey" FOREIGN KEY ("typeOfLeaveId") REFERENCES "TypeOfLeave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveEmployee" ADD CONSTRAINT "LeaveEmployee_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "Leave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveEmployee" ADD CONSTRAINT "LeaveEmployee_employeeNik_fkey" FOREIGN KEY ("employeeNik") REFERENCES "Employee"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialLeave" ADD CONSTRAINT "SpecialLeave_typeOfLeaveId_fkey" FOREIGN KEY ("typeOfLeaveId") REFERENCES "TypeOfLeave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSpecialLeave" ADD CONSTRAINT "EmployeeSpecialLeave_employeeNik_fkey" FOREIGN KEY ("employeeNik") REFERENCES "Employee"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSpecialLeave" ADD CONSTRAINT "EmployeeSpecialLeave_specialLeaveId_fkey" FOREIGN KEY ("specialLeaveId") REFERENCES "SpecialLeave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeductedLeave" ADD CONSTRAINT "DeductedLeave_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "Leave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeductedLeave" ADD CONSTRAINT "DeductedLeave_employeeNik_fkey" FOREIGN KEY ("employeeNik") REFERENCES "Employee"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
