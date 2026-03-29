import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Componentes Core
import Inicio from "./pages/inicio/home.jsx";
import PaginaDeInformacion from "./components/paginasDeInformacion/PageInfo.jsx";
import LayoutConMenu from "./components/layout/LayoutConMenu.jsx";
import PasosIniciales from "./components/escuela/curso/masterFull/primerosPasos.jsx";
import Login from "./components/login/page.jsx";
import Register from "./components/register/page.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { AlertProvider } from "./context/AlertContext.jsx";
import UserProfile from "./components/Profile/UserProfile.jsx";

// Gestión de Cursos y Admin
import CourseForm from "./components/escuela/curso/profesores/CourseForm.jsx";
import CategoryManager from "./components/escuela/curso/components/categorias/CategoryManager.jsx";
import CourseModulesManager from "./components/escuela/curso/profesores/modulos/CourseModulesManager.jsx";
import ModuleClassesManager from "./components/escuela/curso/profesores/clases/ModuleClassesManager.jsx";
import CourseListManager from "./components/escuela/curso/profesores/CourseListManager.jsx";
import CourseCategory from "./components/categorias/CourseCategory.jsx";
import FAQSection from "./components/escuela/curso/profesores/FAQSection.jsx";
import AppTestimonios from "./components/admin/AppTestimonios.jsx";
import CursosDestacados from "./components/admin/CursosDestacados.jsx";
import AllCategoriesCourses from "./components/categorias/AllCategoriesCourses.jsx";
import AnunciosPage from "./components/admin/anuncios/AnunciosPage.jsx";
import UserManagementPanel from "./components/admin/usuarios/UserManagementPanel.jsx";
import SubscriptionPlans from "./components/admin/planes/SubscriptionPlans.jsx";

// Exámenes
import CrearExamen from "./components/escuela/curso/masterFull/examenes/components/CrearExamen.jsx";
import EditarExamen from "./components/escuela/curso/masterFull/examenes/components/EditarExamen.jsx";
import ExamenAlumno from "./components/escuela/curso/masterFull/examenes/ExamenAlumno.jsx";
import ResultadosAlumno from "./components/escuela/curso/masterFull/examenes/ResultadosAlumno.jsx";

/**
 * COMPONENTE NOTIFICADOR
 * Este componente detecta cambios de ruta y avisa al padre (Dashboard)
 */
const NavigationNotifier = () => {
  const location = useLocation();

  useEffect(() => {
    // Enviamos la ruta actual al padre para que la guarde en LocalStorage
    const currentPath = location.pathname + location.search;
    window.parent.postMessage(
      {
        type: "NAVIGATED",
        path: currentPath,
      },
      "*" // Cambiar por el dominio del Dashboard en producción por seguridad
    );
  }, [location]);

  return null;
};

const ProtectedRoute = ({ children, allowedRoles, requireCreatorPrivileges = false }) => {
  const { isAuthenticated, userRole, userCargo, isLoading, user } = useAuth();
  const currentRole = Number(userRole);
  const currentCargo = Number(userCargo);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.group(`🔐 Control de Acceso: ${window.location.pathname}`);
      console.log("👤 Usuario:", user?.nombre || "Cargando...");
      const isAdmin = currentRole === 1;
      const isEmpresario = currentRole === 2;
      const isProfesorAutorizado = currentRole === 3 && currentCargo === 159;
      
      if (requireCreatorPrivileges) {
        const hasAccess = isAdmin || isEmpresario || isProfesorAutorizado;
        console.log(hasAccess ? "✅ Acceso Creador: CONCEDIDO" : "❌ Acceso Creador: DENEGADO");
      }
      console.groupEnd();
    }
  }, [isLoading, isAuthenticated, currentRole, currentCargo, requireCreatorPrivileges, user]);

  if (isLoading) return null; 
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (currentRole === 1) return children;

  if (requireCreatorPrivileges) {
    const isEmpresario = currentRole === 2;
    const isProfesorAutorizado = currentRole === 3 && currentCargo === 159;
    if (isEmpresario || isProfesorAutorizado) return children;
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/" />;
  }
  return children;
};


function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          {/* ESCUCHADOR DE RUTAS ACTIVO */}
          <NavigationNotifier />

          <Routes>
            {/* Rutas Públicas */}
            <Route path="/ofertas" element={<SubscriptionPlans />} />
            
            <Route element={<LayoutConMenu title="General" />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/curso/:id" element={<PaginaDeInformacion />} />
              <Route path="/cursos/:categoryName" element={<CourseCategory />} />
              <Route path="/oferta-del-mes" element={<AllCategoriesCourses />} />

              {/* --- RUTAS EXCLUSIVAS ADMIN (Tipo 1) --- */}
              <Route path="/crear-anuncios" element={
                <ProtectedRoute allowedRoles={[1]}><AnunciosPage /></ProtectedRoute>
              } />
              <Route path="/admin-testimonios" element={
                <ProtectedRoute allowedRoles={[1]}><AppTestimonios /></ProtectedRoute>
              } />
              <Route path="/editar-perfiles" element={
                <ProtectedRoute allowedRoles={[1]}><UserManagementPanel /></ProtectedRoute>
              } />
              <Route path="/dashboard-admin-cursos" element={
                <ProtectedRoute allowedRoles={[1]}><CursosDestacados /></ProtectedRoute>
              } />
              <Route path="/categorias" element={
                <ProtectedRoute allowedRoles={[1]}><CategoryManager /></ProtectedRoute>
              } />

              {/* --- RUTAS GENERALES (Admin, Empresario, Profesional) --- */}
              <Route path="/perfil" element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}><UserProfile /></ProtectedRoute>
              } />
              <Route path="/master-full/:courseId" element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}><PasosIniciales /></ProtectedRoute>
              } />
              <Route path="/cursos/:courseId/examen/:examId" element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}><ExamenAlumno /></ProtectedRoute>
              } />
              <Route path="/cursos/:courseId/examen/:examId/resultados" element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}><ResultadosAlumno /></ProtectedRoute>
              } />

              {/* --- RUTAS DE GESTIÓN (Admin, Empresario Tipo 2, Profesor Tipo 3 + Cargo 155) --- */}
              <Route path="/datos-de-curso" element={
                <ProtectedRoute requireCreatorPrivileges={true}><CourseForm /></ProtectedRoute>
              } />
              <Route path="/mis-cursos" element={
                <ProtectedRoute requireCreatorPrivileges={true}><CourseListManager /></ProtectedRoute>
              } />
              <Route path="/preguntas-frecuentes/:courseId" element={
                <ProtectedRoute requireCreatorPrivileges={true}><FAQSection /></ProtectedRoute>
              } />
              <Route path="/cursos/:courseId/modulos" element={
                <ProtectedRoute requireCreatorPrivileges={true}><CourseModulesManager /></ProtectedRoute>
              } />
              <Route path="/cursos/:courseId/crear-examen" element={
                <ProtectedRoute requireCreatorPrivileges={true}><CrearExamen /></ProtectedRoute>
              } />
              <Route path="/cursos/:courseId/editar-examen/:examId" element={
                <ProtectedRoute requireCreatorPrivileges={true}><EditarExamen /></ProtectedRoute>
              } />
              <Route path="/datos-de-curso/:courseId/modulos/:moduleId/clases" element={
                <ProtectedRoute requireCreatorPrivileges={true}><ModuleClassesManager /></ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;