-- DropForeignKey
ALTER TABLE `Asset` DROP FOREIGN KEY `Asset_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `Asset` DROP FOREIGN KEY `Asset_locationId_fkey`;

-- DropIndex
DROP INDEX `Asset_departmentId_fkey` ON `Asset`;

-- DropIndex
DROP INDEX `Asset_locationId_fkey` ON `Asset`;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
