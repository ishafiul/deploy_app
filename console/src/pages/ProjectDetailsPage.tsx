import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../services/project.service';

interface Project {
  id: string;
  name: string;
  repoUrl: string;
  userId: string;
  url: string;
  status: string;
}

interface BuildLog {
  projectId: string;
  message: string;
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!projectId) return;
        const data = await projectService.getProject(projectId);
        setProject(data);
      } catch (err) {
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    // Connect to WebSocket
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3000');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.buildLogs && data.buildLogs.projectId === projectId) {
        setBuildLogs((prev) => [...prev, data.buildLogs.message]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-medium">Error Loading Project</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0070F3] rounded-md hover:bg-[#0060D3] transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] space-y-4">
        <div className="text-zinc-500 text-center">
          <h3 className="text-lg font-medium">Project Not Found</h3>
          <p className="text-sm">The project you're looking for doesn't exist or you don't have access to it.</p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0070F3] rounded-md hover:bg-[#0060D3] transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1D1D1D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1D1D1D] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
              <div className="flex items-center mt-1 space-x-2 text-sm text-zinc-400">
                <span>Repository</span>
                <span>•</span>
                <a 
                  href={project.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  {project.repoUrl.replace('https://github.com/', '')}
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 text-xs font-medium rounded-full bg-[#1D1D1D] text-zinc-300 border border-[#2D2D2D]">
              {project.status}
            </div>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-white bg-[#0070F3] rounded-md hover:bg-[#0060D3] transition-colors inline-flex items-center space-x-2"
              >
                <span>View Deployment</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Build Logs */}
      <div className="flex-1 flex flex-col px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Build Logs</h2>
          <span className="text-xs text-zinc-500">Real-time updates</span>
        </div>
        <div className="flex-1 bg-[#111111] rounded-lg border border-[#1D1D1D] overflow-hidden">
          <div className="px-4 py-2 border-b border-[#1D1D1D] flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-zinc-400">Build Output</span>
            </div>
          </div>
          <div className="p-6 h-[calc(100vh-250px)] overflow-y-auto font-mono text-sm bg-[#0A0A0A]">
            {buildLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-600">
                <p>Waiting for build logs...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {buildLogs.map((log, index) => (
                  <div key={index} className="text-zinc-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 