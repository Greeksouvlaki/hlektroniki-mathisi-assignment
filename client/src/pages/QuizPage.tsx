import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Circle,
  AlertCircle,
  Send
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
}

interface Answer {
  questionId: string;
  answer: string;
  timeSpent: number;
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // TODO: Fetch quiz from API
        const mockQuiz: Quiz = {
          id: id || '1',
          title: 'JavaScript Fundamentals Quiz',
          description: 'Test your knowledge of JavaScript basics',
          questions: [
            {
              id: '1',
              text: 'What is the correct way to declare a variable in JavaScript?',
              type: 'multiple-choice',
              options: [
                'var myVariable;',
                'let myVariable;',
                'const myVariable;',
                'All of the above'
              ],
              correctAnswer: 'All of the above',
              difficulty: 1
            },
            {
              id: '2',
              text: 'Which method is used to add an element to the end of an array?',
              type: 'multiple-choice',
              options: ['push()', 'pop()', 'shift()', 'unshift()'],
              correctAnswer: 'push()',
              difficulty: 2
            },
            {
              id: '3',
              text: 'JavaScript is a strongly typed language.',
              type: 'true-false',
              options: ['True', 'False'],
              correctAnswer: 'False',
              difficulty: 1
            }
          ],
          timeLimit: 1800, // 30 minutes
          passingScore: 70
        };
        setQuiz(mockQuiz);
      } catch (error) {
        toast.error('Failed to load quiz');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (!quiz?.timeLimit) return;

    const timer = setInterval(() => {
      setTimeSpent(prev => {
        if (prev >= quiz.timeLimit!) {
          handleSubmit();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz?.timeLimit]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const answeredQuestions = answers.length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswerChange = (answer: string) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion?.id);
    const newAnswer: Answer = {
      questionId: currentQuestion!.id,
      answer,
      timeSpent: 0 // TODO: Track individual question time
    };

    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = newAnswer;
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, newAnswer]);
    }
  };

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion?.id)?.answer || '';
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length < totalQuestions) {
      const confirmed = window.confirm(
        `You have answered ${answers.length} out of ${totalQuestions} questions. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Submit answers to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      toast.success('Quiz submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (): string => {
    if (!quiz?.timeLimit) return '';
    const remaining = quiz.timeLimit - timeSpent;
    return formatTime(Math.max(0, remaining));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Quiz not found</h2>
          <p className="text-gray-600 mt-2">The quiz you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              {quiz.timeLimit && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-medium">{getTimeRemaining()}</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{answeredQuestions} answered</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion?.text}
            </h2>

            {currentQuestion?.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      getCurrentAnswer() === option
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={getCurrentAnswer() === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      {getCurrentAnswer() === option ? (
                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-3" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'true-false' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      getCurrentAnswer() === option
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={getCurrentAnswer() === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      {getCurrentAnswer() === option ? (
                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-3" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'fill-blank' && (
              <div>
                <textarea
                  value={getCurrentAnswer()}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                />
              </div>
            )}

            {currentQuestion?.type === 'essay' && (
              <div>
                <textarea
                  value={getCurrentAnswer()}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Write your detailed answer..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={6}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-4">
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 