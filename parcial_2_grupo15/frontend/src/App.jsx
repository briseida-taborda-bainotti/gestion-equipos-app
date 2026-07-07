import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LayoutPrincipal from './layouts/LayoutPrincipal.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SolicitudesList from './pages/SolicitudesList.jsx';
import SolicitudDetalle from './pages/SolicitudDetalle.jsx';
import SolicitudForm from './pages/SolicitudForm.jsx';
import Resumen from './pages/Resumen.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/solicitudes" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><LayoutPrincipal /></ProtectedRoute>}>
            <Route path="/solicitudes" element={<SolicitudesList />} />
            <Route path="/solicitudes/nueva" element={<SolicitudForm />} />
            <Route path="/solicitudes/:id" element={<SolicitudDetalle />} />
            <Route path="/solicitudes/:id/editar" element={<SolicitudForm />} />
            <Route path="/resumen" element={<ProtectedRoute roles={['admin', 'encargado']}><Resumen /></ProtectedRoute>} />
          </Route>
          {/* Ruta comodín */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
