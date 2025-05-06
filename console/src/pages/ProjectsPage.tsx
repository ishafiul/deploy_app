import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';
import { projectService } from '../services/project.service';
import { toast } from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  repoUrl: string;
  userId: string;
  url: string;
  status: string;
}

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      setError(null);
      console.log('Fetching projects...');
      const response = await projectService.getProjects();
      console.log('Projects response:', response);
      
      // Handle both possible response formats
      const projectsData = 'projects' in response ? response.projects : response;
      if (!Array.isArray(projectsData)) {
        throw new Error('Invalid projects data received');
      }
      
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleCreateProject = async (data: { name: string; githubUrl: string }) => {
    try {
      setIsLoading(true);
      console.log('Creating project:', data);
      const response = await projectService.createProject({
        name: data.name,
        repoUrl: data.githubUrl,
      });
      console.log('Project created:', response);
      toast.success('Project created successfully!');
      setIsCreateModalOpen(false);
      // Refresh projects list before navigating
      await fetchProjects();
      // Navigate to project details page
      navigate(`/projects/${response.projectId}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create project';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Debug logging
  console.log('Rendering ProjectsPage with state:', {
    isLoadingProjects,
    projectsLength: projects.length,
    error,
    projects
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-medium">Error Loading Projects</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => fetchProjects()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='lg:ml-10 py-5'>
      <div className="border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className='text-start'>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Projects</h1>
            <p className="my-2  text-sm sm:text-base font-medium text-zinc-400">Manage your React projects and deployments.</p>
          </div>
          <div className="my-4 sm:my-0">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {isLoadingProjects ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="p-4 sm:p-6 lg:p-8 text-center">
            <div className="max-w-sm mx-auto">
              <svg className="w-12 h-12 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">No projects yet</h3>
              <p className="mt-2 text-sm text-zinc-400">Get started by creating your first React project.</p>
              <div className="mt-6">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors duration-200"
                >
                  Create your first project →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-zinc-900/40 backdrop-blur-md rounded-lg border border-zinc-800 p-4 cursor-pointer hover:border-zinc-700 transition-all duration-200"
            >
              <div className="flex justify-between gap-2 items-start mb-4">
                <h3 className="text-lg font-medium text-white overflow-hidden">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-zinc-400 truncate mb-4">{project.repoUrl}</p>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Deployment →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isLoading && setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <CreateProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => !isLoading && setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}; 