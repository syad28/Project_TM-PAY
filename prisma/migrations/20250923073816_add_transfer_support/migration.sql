/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `investasi` DROP FOREIGN KEY `Investasi_userId_fkey`;

-- DropForeignKey
ALTER TABLE `kritiksaran` DROP FOREIGN KEY `KritikSaran_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tabungan` DROP FOREIGN KEY `Tabungan_userId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_userId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_userTujuanId_fkey`;

-- DropIndex
DROP INDEX `Investasi_userId_fkey` ON `investasi`;

-- DropIndex
DROP INDEX `KritikSaran_userId_fkey` ON `kritiksaran`;

-- DropIndex
DROP INDEX `Tabungan_userId_fkey` ON `tabungan`;

-- DropIndex
DROP INDEX `Transaksi_userId_fkey` ON `transaksi`;

-- DropIndex
DROP INDEX `Transaksi_userTujuanId_fkey` ON `transaksi`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `no_hp` VARCHAR(20) NULL,
    `password` VARCHAR(255) NOT NULL,
    `saldo` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `pin_transaksi` VARCHAR(255) NULL,
    `status_akun` VARCHAR(191) NOT NULL DEFAULT 'active',
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `email_verified_at` DATETIME(3) NULL,
    `phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `phone_verified_at` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `password_changed_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `failed_login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `avatar_url` TEXT NULL,
    `date_of_birth` DATETIME(3) NULL,
    `gender` VARCHAR(10) NULL,
    `address` TEXT NULL,
    `ktp_number` VARCHAR(20) NULL,
    `ktp_verified` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_no_hp_key`(`no_hp`),
    UNIQUE INDEX `users_ktp_number_key`(`ktp_number`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_no_hp_idx`(`no_hp`),
    INDEX `users_status_akun_idx`(`status_akun`),
    INDEX `users_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `token` TEXT NOT NULL,
    `refresh_token` TEXT NULL,
    `device_info` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_sessions_user_id_idx`(`user_id`),
    INDEX `user_sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_activities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_activities_user_id_idx`(`user_id`),
    INDEX `user_activities_action_idx`(`action`),
    INDEX `user_activities_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_activities` ADD CONSTRAINT `user_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tabungan` ADD CONSTRAINT `Tabungan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_userTujuanId_fkey` FOREIGN KEY (`userTujuanId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KritikSaran` ADD CONSTRAINT `KritikSaran_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Investasi` ADD CONSTRAINT `Investasi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
