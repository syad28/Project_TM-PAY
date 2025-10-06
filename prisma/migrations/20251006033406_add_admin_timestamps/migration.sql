/*
  Warnings:

  - You are about to drop the `investasi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `riwayatinvestasi` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `investasi` DROP FOREIGN KEY `Investasi_userId_fkey`;

-- DropForeignKey
ALTER TABLE `riwayatinvestasi` DROP FOREIGN KEY `RiwayatInvestasi_investasiId_fkey`;

-- AlterTable
ALTER TABLE `admin` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `investasi`;

-- DropTable
DROP TABLE `riwayatinvestasi`;
