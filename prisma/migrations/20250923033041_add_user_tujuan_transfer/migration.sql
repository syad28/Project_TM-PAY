-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `userTujuanId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_userTujuanId_fkey` FOREIGN KEY (`userTujuanId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
