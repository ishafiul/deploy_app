import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import {integer} from "drizzle-orm/sqlite-core";

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    repoUrl: text('repo_url').notNull(),
    userId: text('user_id').notNull(),
    status: text('status').notNull().default('pending'),

});

export const buildLogs = sqliteTable('build_logs', {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    userId: text('user_id').notNull(),
    message: text('message').notNull(),
    level: text('level').notNull(),
    timestamp: integer('timestamp', {mode: 'timestamp'}).default(sql`(strftime('%s', 'now'))`)
});
