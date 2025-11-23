-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_departmentId_fkey`;

-- DropIndex
DROP INDEX `Transaction_departmentId_fkey` ON `transaction`;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `referenceNo` VARCHAR(191) NULL,
    ADD COLUMN `supplier` VARCHAR(191) NULL,
    MODIFY `departmentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
