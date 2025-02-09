import { useState } from 'react';

interface CreateProjectFormProps {
  onSubmit: (data: { name: string; githubUrl: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreateProjectForm = ({ onSubmit, onCancel, isLoading = false }: CreateProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    githubUrl: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    githubUrl: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      githubUrl: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.githubUrl.trim()) {
      newErrors.githubUrl = 'GitHub URL is required';
    } else if (!formData.githubUrl.match(/^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+$/)) {
      newErrors.githubUrl = 'Please enter a valid GitHub repository URL';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
          Project Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="My Awesome Project"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium text-white mb-1">
          GitHub Repository URL
        </label>
        <input
          type="text"
          id="githubUrl"
          value={formData.githubUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://github.com/username/repository"
          disabled={isLoading}
        />
        {errors.githubUrl && <p className="mt-1 text-sm text-red-500">{errors.githubUrl}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating...</span>
            </>
          ) : (
            <span>Create Project</span>
          )}
        </button>
      </div>
    </form>
  );
}; 