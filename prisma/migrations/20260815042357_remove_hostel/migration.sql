-- DropForeignKey
ALTER TABLE "hostel_rooms" DROP CONSTRAINT "hostel_rooms_hostelId_fkey";

-- DropForeignKey
ALTER TABLE "hostels" DROP CONSTRAINT "hostels_branchId_fkey";

-- DropForeignKey
ALTER TABLE "hostels" DROP CONSTRAINT "hostels_wardenId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_hostelRoomId_fkey";

-- DropIndex
DROP INDEX "students_hostelRoomId_idx";

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "isHostel";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "hostelRoomId";

-- DropTable
DROP TABLE "hostel_rooms";

-- DropTable
DROP TABLE "hostels";

