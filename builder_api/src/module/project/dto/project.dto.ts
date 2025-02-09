import { z } from '@hono/zod-openapi';

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  repoUrl: z.string(),
  userId: z.string(),
  url: z.string(),
  status: z.string(),
});

export const ProjectsResponseSchema = z.object({
  projects: z.array(ProjectSchema),
});

export const ProjectResponseSchema = ProjectSchema;

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectsResponse = z.infer<typeof ProjectsResponseSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>; 