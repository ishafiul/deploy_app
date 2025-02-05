PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_build_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`message` text NOT NULL,
	`level` text NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_build_logs`("id", "project_id", "user_id", "message", "level", "timestamp") SELECT "id", "project_id", "user_id", "message", "level", "timestamp" FROM `build_logs`;--> statement-breakpoint
DROP TABLE `build_logs`;--> statement-breakpoint
ALTER TABLE `__new_build_logs` RENAME TO `build_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;