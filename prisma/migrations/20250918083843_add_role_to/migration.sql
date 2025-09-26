/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tabunganId` to the `Transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `tabunganId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'user';

-- DropTable
DROP TABLE `admin`;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_tabunganId_fkey` FOREIGN KEY (`tabunganId`) REFERENCES `Tabungan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
