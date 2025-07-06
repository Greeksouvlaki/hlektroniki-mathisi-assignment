import { useEffect, useState } from 'react';
import { apiClient, Quiz } from '../services/api';
import { Link } from 'react-router-dom';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await apiClient.getQuizzes();
        setQuizzes(response.data || []);
      } catch (err) {
        setError('Failed to load quizzes');
        console.error('Quiz fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">Available Quizzes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="card hover:shadow-md transition-shadow">
            <div className="card-header">
              <h2 className="card-title">{quiz.title}</h2>
              <p className="card-description">{quiz.description}</p>
            </div>
            <div className="card-content">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>Difficulty:</span>
                <span className="capitalize font-medium">{quiz.difficulty}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Questions:</span>
                <span>{quiz.questions.length}</span>
              </div>
            </div>
            <div className="card-footer">
              <Link to={`/quiz/${quiz.id}`} className="btn btn-primary w-full">
                Start Quiz
              </Link>
            </div>
          </div>
        ))}
      </div>
      {quizzes.length === 0 && (
        <div className="text-center py-12 text-gray-500">No quizzes available.</div>
      )}
    </div>
  );
};

export default QuizzesPage; 