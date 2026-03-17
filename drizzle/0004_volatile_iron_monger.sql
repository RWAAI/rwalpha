CREATE TABLE `kyc_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','submitted','approved','rejected') NOT NULL DEFAULT 'pending',
	`fullName` varchar(128),
	`idType` varchar(32),
	`idNumber` varchar(64),
	`country` varchar(64),
	`dateOfBirth` varchar(10),
	`submittedAt` timestamp,
	`reviewedAt` timestamp,
	`rejectReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kyc_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_dividend_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`tokenSymbol` varchar(32) NOT NULL,
	`amount` decimal(16,4) NOT NULL,
	`amountPerToken` decimal(12,6),
	`status` enum('pending','claimable','claimed') NOT NULL DEFAULT 'claimable',
	`claimedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_dividend_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenSymbol` varchar(32) NOT NULL,
	`quantity` decimal(20,6) NOT NULL DEFAULT '0',
	`navPerToken` decimal(12,4),
	`totalValue` decimal(20,4),
	`change24h` decimal(8,4),
	`totalReturn` decimal(8,4),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_holdings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_bindings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`address` varchar(128) NOT NULL,
	`chain` varchar(32) NOT NULL DEFAULT 'Ethereum',
	`label` varchar(64),
	`isPrimary` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_bindings_id` PRIMARY KEY(`id`)
);
