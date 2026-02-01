-- Add OAuth metadata fields to User
ALTER TABLE `User` ADD COLUMN `oauthSub` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `oauthClientRole` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `lastOauthLoginAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `User_oauthSub_key` ON `User`(`oauthSub`);
