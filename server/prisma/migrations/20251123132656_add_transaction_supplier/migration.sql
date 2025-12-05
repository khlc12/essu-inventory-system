-- DropForeignKey (table name corrected for case-sensitive MySQL)
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_departmentId_fkey`;

-- AlterTable
ALTER TABLE `Transaction`
    ADD COLUMN `referenceNo` VARCHAR(191) NULL,
    ADD COLUMN `supplier` VARCHAR(191) NULL,
    MODIFY `departmentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
