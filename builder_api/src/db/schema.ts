import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey().notNull(), // UUID stored as TEXT
    name: text('name').notNull(),
    repoUrl: text('repo_url').notNull(),
    userId: text('user_id').notNull(), // UUID stored as TEXT
    status: text('status').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const buildLogs = sqliteTable('build_logs', {
    id: text('id').primaryKey().notNull().default(sql`lower(hex(randomblob(16)))`), // Generate a random UUID equivalent
    projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    message: text('message').notNull(),
    level: text('level').notNull(), // 'info', 'error', 'warning'
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
