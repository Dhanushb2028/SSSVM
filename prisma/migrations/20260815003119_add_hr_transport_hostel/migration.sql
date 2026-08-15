-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'PART_TIME');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'LEFT');

-- CreateEnum
CREATE TYPE "StaffAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_DUTY', 'LEAVE');

-- CreateEnum
CREATE TYPE "SalaryComponentType" AS ENUM ('EARNING', 'DEDUCTION');

-- AlterTable
ALTER TABLE "staff_members" ADD COLUMN     "department" TEXT,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'PERMANENT',
ADD COLUMN     "leftDate" TIMESTAMP(3),
ADD COLUMN     "leftReason" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "hostelRoomId" TEXT,
ADD COLUMN     "routeStopId" TEXT;

-- CreateTable
CREATE TABLE "staff_attendance" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "StaffAttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "markedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_components" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SalaryComponentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_salary_components" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "salaryComponentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "grossEarnings" DOUBLE PRECISION NOT NULL,
    "totalDeductions" DOUBLE PRECISION NOT NULL,
    "netPay" DOUBLE PRECISION NOT NULL,
    "generatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_routes" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleId" TEXT,
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostels" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wardenId" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_rooms" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "hostel_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_attendance_branchId_date_idx" ON "staff_attendance"("branchId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_attendance_staffMemberId_date_key" ON "staff_attendance"("staffMemberId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "salary_components_organizationId_name_key" ON "salary_components"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "staff_salary_components_staffMemberId_salaryComponentId_key" ON "staff_salary_components"("staffMemberId", "salaryComponentId");

-- CreateIndex
CREATE INDEX "payslips_branchId_year_month_idx" ON "payslips"("branchId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_staffMemberId_month_year_key" ON "payslips"("staffMemberId", "month", "year");

-- CreateIndex
CREATE INDEX "vehicles_branchId_idx" ON "vehicles"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_branchId_vehicleNumber_key" ON "vehicles"("branchId", "vehicleNumber");

-- CreateIndex
CREATE INDEX "transport_routes_branchId_idx" ON "transport_routes"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_routes_branchId_name_key" ON "transport_routes"("branchId", "name");

-- CreateIndex
CREATE INDEX "route_stops_routeId_idx" ON "route_stops"("routeId");

-- CreateIndex
CREATE INDEX "hostels_branchId_idx" ON "hostels"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "hostels_branchId_name_key" ON "hostels"("branchId", "name");

-- CreateIndex
CREATE INDEX "hostel_rooms_hostelId_idx" ON "hostel_rooms"("hostelId");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_hostelId_roomNumber_key" ON "hostel_rooms"("hostelId", "roomNumber");

-- CreateIndex
CREATE INDEX "students_routeStopId_idx" ON "students"("routeStopId");

-- CreateIndex
CREATE INDEX "students_hostelRoomId_idx" ON "students"("hostelRoomId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_routeStopId_fkey" FOREIGN KEY ("routeStopId") REFERENCES "route_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_hostelRoomId_fkey" FOREIGN KEY ("hostelRoomId") REFERENCES "hostel_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendance" ADD CONSTRAINT "staff_attendance_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendance" ADD CONSTRAINT "staff_attendance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendance" ADD CONSTRAINT "staff_attendance_markedByUserId_fkey" FOREIGN KEY ("markedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_components" ADD CONSTRAINT "salary_components_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_salary_components" ADD CONSTRAINT "staff_salary_components_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_salary_components" ADD CONSTRAINT "staff_salary_components_salaryComponentId_fkey" FOREIGN KEY ("salaryComponentId") REFERENCES "salary_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_routes" ADD CONSTRAINT "transport_routes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_routes" ADD CONSTRAINT "transport_routes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_wardenId_fkey" FOREIGN KEY ("wardenId") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_rooms" ADD CONSTRAINT "hostel_rooms_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
