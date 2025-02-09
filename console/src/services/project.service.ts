import { api } from './api';

interface CreateProjectResponse {
  jobId: string;
  projectId: string;
  message: string;
}

interface CreateProjectData {
  name: string;
  repoUrl: string;
}

interface Project {
  id: string;
  name: string;
  repoUrl: string;
  userId: string;
  url: string;
  status: string;
}

interface ProjectsResponse {
  projects: Project[];
}

interface BuildLogsResponse {
  success: boolean;
  data: Array<{
    id: string;
    projectId: string;
    userId: string;
    message: string;
    level: string;
    timestamp: string;
  }>;
}

export const projectService = {
  createProject: async (data: CreateProjectData): Promise<CreateProjectResponse> => {
    const response = await api.post<CreateProjectResponse>('/build', {
      name: data.name,
      repoUrl: data.repoUrl,
    });
    return response.data;
  },

  getProjects: async (): Promise<Project[]> => {
    try {
      console.log('Making API request to /projects');
      const response = await api.get<ProjectsResponse>('/projects');
      console.log('API response:', response.data);
      
      // Handle both possible response formats
      if ('projects' in response.data) {
        return response.data.projects;
      }
      
      // If response is an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      throw new Error('Invalid response format from API');
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  },

  getProject: async (projectId: string): Promise<Project> => {
    try {
      console.log(`Making API request to /projects/${projectId}`);
      const response = await api.get<Project>(`/projects/${projectId}`);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  },

  getBuildLogs: async (projectId: string): Promise<string[]> => {
    try {
      console.log(`Making API request to /build/logs/${projectId}`);
      const response = await api.get<BuildLogsResponse>(`/build/logs/${projectId}`);
      console.log('Build logs API response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        // Map the logs array to just the messages, filtering out empty messages
        return response.data.data
          .map(log => `[${log.level}] ${log.message}`)
          .filter(message => message.trim() !== '');
      }
      
      return [];
    } catch (error) {
      console.error('Error in getBuildLogs:', error);
      throw error;
    }
  }
}; 