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
  }
}; 