CREATE TABLE `ai_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`signalDate` timestamp NOT NULL,
	`marketSentiment` varchar(64),
	`nvdyVolRisk` varchar(64),
	`qqqiPremium` varchar(64),
	`qqqmVgtMomentum` varchar(64),
	`rebalanceSignal` varchar(64),
	`rawJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dividend_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`ticker` varchar(16) NOT NULL,
	`amountPerUnit` decimal(12,6) NOT NULL,
	`totalAmount` decimal(16,4),
	`frequency` varchar(16) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dividend_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nav_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`navValue` decimal(12,4) NOT NULL,
	`totalReturn` decimal(8,4),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nav_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rebalance_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actionDate` varchar(10) NOT NULL,
	`icon` varchar(8),
	`action` text NOT NULL,
	`tag` varchar(32) NOT NULL,
	`tagEn` varchar(32),
	`actionEn` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rebalance_logs_id` PRIMARY KEY(`id`)
);
