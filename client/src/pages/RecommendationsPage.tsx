import { useEffect, useState } from 'react';
import { apiClient, Module, Quiz } from '../services/api';
import { Link } from 'react-router-dom';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<(Module | Quiz)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await apiClient.getRecommendations();
        setRecommendations(response.data || []);
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading recommendations...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">Recommended for You</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item: any) => (
          <div key={item.id || item._id} className="card hover:shadow-md transition-shadow">
            <div className="card-header">
              <h2 className="card-title">{item.title}</h2>
              <p className="card-description">{item.description}</p>
            </div>
            <div className="card-content">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>Type:</span>
                <span className="capitalize font-medium">{'questions' in item ? 'Quiz' : 'Module'}</span>
              </div>
              {'questions' in item && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Questions:</span>
                  <span>{item.questions.length}</span>
                </div>
              )}
            </div>
            <div className="card-footer">
              {'questions' in item ? (
                <Link to={`/quiz/${item.id || item._id}`} className="btn btn-primary w-full">
                  Start Quiz
                </Link>
              ) : (
                <Link to={`/modules`} className="btn btn-outline w-full">
                  View Module
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      {recommendations.length === 0 && (
        <div className="text-center py-12 text-gray-500">No recommendations available.</div>
      )}
    </div>
  );
};

export default RecommendationsPage; 