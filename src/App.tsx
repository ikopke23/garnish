import { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageContainer from './containers/PageContainer';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Toaster } from '@/components/ui/sonner';
import './index.css';

// Pages
import RecipeFeed from './pages/RecipeFeed';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import FamilyManager from './pages/FamilyManager';
import StoryForm from './pages/StoryForm';
import RecipeImport from './pages/RecipeImport';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<RecipeFeed />} />
        <Route path="/recipes/create" element={
          <ProtectedRoute><RecipeForm /></ProtectedRoute>
        } />
        <Route path="/recipes/:rid" element={<RecipeDetail />} />
        <Route path="/recipes/:rid/edit" element={
          <ProtectedRoute><RecipeForm editMode /></ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={
          <ProtectedRoute><UserProfile /></ProtectedRoute>
        } />
        <Route path="/family" element={
          <ProtectedRoute><FamilyManager /></ProtectedRoute>
        } />
        <Route path="/recipes/import" element={
          <ProtectedRoute><RecipeImport /></ProtectedRoute>
        } />
        <Route path="/stories/new" element={<ProtectedRoute><StoryForm /></ProtectedRoute>} />
        <Route path="/stories/:sid/edit" element={<ProtectedRoute><StoryForm editMode /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="bottom-center"
          duration={2200}
          toastOptions={{
            style: {
              background: 'var(--g-text)',
              color: 'var(--g-bg)',
              borderRadius: '4px',
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
