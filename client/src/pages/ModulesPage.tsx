import { useState, useEffect } from 'react';
import { apiClient, Module } from '../services/api';

interface ModuleWithProgress extends Module {
  isCompleted: boolean;
  progress: number;
}

const ModulesPage = () => {
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await apiClient.getModules();
        const modulesWithProgress = (response.data || []).map(module => ({
          ...module,
          isCompleted: false, // This would come from progress API
          progress: 0 // This would come from progress API
        }));
        setModules(modulesWithProgress);
      } catch (err) {
        setError('Failed to load modules');
        console.error('Error fetching modules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading modules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
        <p className="mt-2 text-gray-600">
          Explore our adaptive learning modules designed to match your skill level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module._id || module.id} className="card hover:shadow-md transition-shadow">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <h3 className="card-title">{module.title}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                    module.difficulty
                  )}`}
                >
                  {module.difficulty}
                </span>
              </div>
              <p className="card-description">{module.description}</p>
            </div>
            
            <div className="card-content">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  {module.estimatedDuration || module.duration || 30} minutes
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Subject:</h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {module.subject}
                    </span>
                  </div>
                </div>

                {module.progress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer">
              <a href={`/modules/${module._id || module.id}`} className="btn btn-primary w-full">
                {module.isCompleted ? 'Review Module' : 'Start Module'}
              </a>
            </div>
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No modules available</h3>
          <p className="text-gray-600">Check back later for new learning content.</p>
        </div>
      )}
    </div>
  );
};

export default ModulesPage; 