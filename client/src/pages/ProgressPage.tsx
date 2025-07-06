import { useEffect, useState } from 'react';
import { apiClient, Progress } from '../services/api';

const ProgressPage = () => {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiClient.getProgress();
        setProgress(response.data || []);
      } catch (err) {
        setError('Failed to load progress');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading progress...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">Your Learning Progress</h1>
      
      {progress.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">No progress data available yet.</p>
          <p>Start taking quizzes and completing modules to see your progress here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.map((item) => (
            <div key={item.id || item._id} className="card">
              <div className="card-header">
                <h2 className="card-title">{item.moduleTitle || item.quizTitle}</h2>
                <p className="card-description">
                  {item.moduleTitle ? 'Module Progress' : 'Quiz Result'}
                </p>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {item.moduleTitle ? `${item.progressPercentage || 0}%` : `${item.score || 0}%`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.moduleTitle ? 'Completion' : 'Score'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'In Progress'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.completedAt ? 'Completed' : 'Status'}
                    </div>
                  </div>
                </div>
                {item.moduleTitle && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressPage; 