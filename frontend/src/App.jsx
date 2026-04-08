import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PostTaskPage from './pages/PostTaskPage';
import HistoryPage from './pages/HistoryPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import HelpSupportPage from './pages/HelpSupportPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 sunlight-gradient rounded-xl rotate-12 flex items-center justify-center shadow-lg">
            <span
              className="material-symbols-outlined text-white text-4xl -rotate-12"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </div>
          <span className="text-primary font-semibold animate-pulse">Loading TaskSnap…</span>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/home" replace /> : children;
}

function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem('tasksnap_admin_key') === 'admin_verified';
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/post" element={<ProtectedRoute><PostTaskPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/chat/:taskId/:applicantId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><HelpSupportPage /></ProtectedRoute>} />

          {/* Admin Context */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
