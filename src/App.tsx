// src/App.tsx
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './layouts/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import { useAuthStore } from './store/authStore';


// Layout con Header para páginas autenticadas
function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Header user={user ?? undefined} onLogout={handleLogout} />
      <main>{children}</main>
    </div>
  );
}

function App() {
  const checkTokenValidity = useAuthStore(state => state.checkTokenValidity);

  useEffect(() => {
    checkTokenValidity();

    // Verificar cada 5 minutos si el access token sigue vigente
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkTokenValidity]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Solo ADMIN y HR_MANAGER gestionan empleados; EMPLOYEE no entra */}
        <Route path="/empleados" element={
          <ProtectedRoute>
            <AppLayout>
              <RoleGuard allowedRoles={['ADMIN', 'HR_MANAGER']}>
                <EmployeesPage />
              </RoleGuard>
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Redirigir raíz según autenticación */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#f8fafc' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
            duration: 6000,
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;