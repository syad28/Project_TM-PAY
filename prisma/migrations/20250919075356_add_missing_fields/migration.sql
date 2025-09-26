/*
  Warnings:

  - You are about to alter the column `jenis` on the `transaksi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `nama` to the `Tabungan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_tabunganId_fkey`;

-- DropIndex
DROP INDEX `Transaksi_tabunganId_fkey` ON `transaksi`;

-- AlterTable
ALTER TABLE `tabungan` ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    ADD COLUMN `tabunganId` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `transaksi` MODIFY `jenis` ENUM('setor', 'tarik', 'topup', 'transfer') NOT NULL,
    MODIFY `tabunganId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `no_hp` VARCHAR(191) NULL,
    ADD COLUMN `pin_transaksi` VARCHAR(191) NULL,
    ADD COLUMN `status_akun` VARCHAR(191) NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KritikSaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pesan` TEXT NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogAktivitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aktivitas` TEXT NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `adminId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Investasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiwayatInvestasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aksi` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `investasiId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tabungan` ADD CONSTRAINT `Tabungan_tabunganId_fkey` FOREIGN KEY (`tabunganId`) REFERENCES `Tabungan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_tabunganId_fkey` FOREIGN KEY (`tabunganId`) REFERENCES `Tabungan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KritikSaran` ADD CONSTRAINT `KritikSaran_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogAktivitas` ADD CONSTRAINT `LogAktivitas_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Investasi` ADD CONSTRAINT `Investasi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiwayatInvestasi` ADD CONSTRAINT `RiwayatInvestasi_investasiId_fkey` FOREIGN KEY (`investasiId`) REFERENCES `Investasi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
