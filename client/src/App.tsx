import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import ModulePage from './pages/ModulePage';
import ProfilePage from './pages/ProfilePage';
import ModulesPage from './pages/ModulesPage';
import ProtectedRoute from './components/ProtectedRoute';
import QuizzesPage from './pages/QuizzesPage';
import ProgressPage from './pages/ProgressPage';
import RecommendationsPage from './pages/RecommendationsPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="modules/:id" element={<ModulePage />} />
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="quiz/:id" element={<QuizPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App; 