import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // <-- Quita 'Outlet' de aquí
import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Importa tus componentes de página y layout
import Inicio from "./pages/inicio/home.jsx";
import PaginaDeInformacion from "./components/paginasDeInformacion/PageInfo.jsx";
import LayoutConMenu from "./components/layout/LayoutConMenu.jsx"; // Asegúrate de que este archivo esté correcto
import PasosIniciales from "./components/escuela/curso/masterFull/primerosPasos.jsx";
import Login from "./components/login/page.jsx";
import Register from "./components/register/page.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import UserProfile from "./components/Profile/UserProfile.jsx";
import ExamComponent from "./pages/examenes/ExamComponent.jsx";
import ExamResults from "./pages/examenes/ExamResults.jsx";
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

/**
 * Componente ProtectedRoute mejorado para controlar el acceso basado en la autenticación y el rol del usuario.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {number[]} [props.allowedRoles] - Un array de roles permitidos para acceder a esta ruta.
 * Si no se proporciona, solo se verifica la autenticación.
 * Roles: 1=Administrador, 2=Profesor, 3=Alumno.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Si el usuario no tiene el rol permitido, redirige a la página de inicio
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas SIN LAYOUT */}
          {/* Estas rutas se renderizarán directamente sin el LayoutConMenu */}
          <Route path="/ofertas" element={<SubscriptionPlans />} />

          {/* Rutas CON LAYOUT */}
          {/* La ruta padre usa el componente LayoutConMenu como elemento. */}
          {/* Todas las rutas anidadas dentro de esta se renderizarán dentro del <Outlet /> de LayoutConMenu. */}
          <Route element={<LayoutConMenu title="General" />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/curso/:id" element={<PaginaDeInformacion />} />
            <Route path="/cursos/:categoryName" element={<CourseCategory />} />
            <Route path="/oferta-del-mes" element={<AllCategoriesCourses />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/curso/:id/register" element={<Register />} />
            {/* Rutas Protegidas */}
            <Route
              path="/crear-anuncios"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <AnunciosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master-full/:courseId"
              element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}>
                  <PasosIniciales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-admin"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <AppTestimonios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editar-perfiles"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <UserManagementPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-admin-cursos"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <CursosDestacados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examName"
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <ExamComponent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-results"
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <ExamResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/datos-de-curso"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-cursos"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <CourseListManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preguntas-frecuentes/:courseId"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <FAQSection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cursos/:courseId/modulos"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <CourseModulesManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/datos-de-curso/:courseId/modulos/:moduleId/clases"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <ModuleClassesManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <CategoryManager />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
