import { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageContainer from './containers/PageContainer';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'csh-material-bootstrap/dist/csh-material-bootstrap.css';
import './styles/theme.scss';

// Pages
import RecipeFeed from './pages/RecipeFeed';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import FamilyManager from './pages/FamilyManager';
import NotFound from './pages/NotFound';

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
        <Route path="/profile" element={
          <ProtectedRoute><UserProfile /></ProtectedRoute>
        } />
        <Route path="/family" element={
          <ProtectedRoute><FamilyManager /></ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
