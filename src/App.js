import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// Por favor, asegúrate de que estos archivos existen en las rutas y con los nombres exactos (incluyendo mayúsculas/minúsculas).
import Inicio from "./pages/inicio/home.jsx";
import PaginaDeInformacion from "./components/paginasDeInformacion/PageInfo.jsx";
import LayoutConMenu from "./components/layout/LayoutConMenu.jsx";
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
// Se eliminó la importación de TestimoniosProvider

/**
 * Componente ProtectedRoute mejorado para controlar el acceso basado en la autenticación y el rol del usuario.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que se renderán si el usuario tiene acceso.
 * @param {number[]} [props.allowedRoles] - Un array de roles permitidos para acceder a esta ruta.
 * Si no se proporciona, solo se verifica la autenticación.
 * Roles: 1=Administrador, 2=Profesor, 3=Alumno.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth(); // Asume que useAuth() proporciona isAuthenticated y userRole

  // Añadir console.log para ver los datos que trae userAuth
  console.log("Estado de autenticación:", isAuthenticated);
  console.log("Rol del usuario:", userRole);
  console.log("Roles permitidos para esta ruta:", allowedRoles);


  // Si el usuario no está autenticado, redirige al login.
  if (!isAuthenticated) {
    console.log("Acceso denegado: Usuario no autenticado. Redirigiendo a /login.");
    return <Navigate to="/login" />;
  }

  // Si se especifican roles permitidos y el rol del usuario no está en ellos, redirige al inicio.
  // Esto previene que usuarios con roles incorrectos accedan a páginas específicas.
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`Acceso denegado: Rol ${userRole} no permitido. Roles permitidos: ${allowedRoles}. Redirigiendo a /.`, );
    return <Navigate to="/" />; // Podrías redirigir a una página de "Acceso Denegado"
  }

  // Si el usuario está autenticado y su rol es permitido, renderiza los hijos.
  return children;
};

function App() {
  return (
    // AuthProvider envuelve toda la aplicación para la autenticación
    <AuthProvider>
      {/* Se eliminó TestimoniosProvider */}
      <BrowserRouter>
        <LayoutConMenu title="General">
          <Routes>
            {/* Rutas Públicas - Accesibles para todos (no requieren autenticación ni rol específico) */}
            <Route path="/" element={<Inicio />} />
            <Route path="/curso/:id" element={<PaginaDeInformacion />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/curso/:id/register" element={<Register />} />
            <Route path="/cursos/:categoryName" element={<CourseCategory />} />

            {/* Rutas Protegidas por Autenticación y Rol */}

            {/* Ruta para Master Full (solo Alumnos) */}
            <Route
              path="/master-full/:courseId"
              element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}> {/* Solo Alumnos */}
                  <PasosIniciales />
                </ProtectedRoute>
              }
            />

            {/* Ruta para Dashboard Admin (solo Administradores) */}
            <Route
              path="/dashboard-admin"
              element={
                <ProtectedRoute allowedRoles={[1]}> {/* Solo Administradores */}
                  <AppTestimonios /> {/* Este es el panel de administración que gestionará los testimonios */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-admin-cursos"
              element={
                <ProtectedRoute allowedRoles={[1]}> {/* Solo Administradores */}
                  <CursosDestacados /> {/* Este es el panel de administración que gestionará los testimonios */}
                </ProtectedRoute>
              }
            />

            {/* Ruta para Perfil de Usuario (todos los roles autenticados) */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}> {/* Administrador, Profesor, Alumno */}
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Exámenes (solo Alumnos) */}
            <Route
              path="/exam/:examName"
              element={
                <ProtectedRoute allowedRoles={[3]}> {/* Solo Alumnos */}
                  <ExamComponent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-results"
              element={
                <ProtectedRoute allowedRoles={[3]}> {/* Solo Alumnos */}
                  <ExamResults />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Administración de Cursos (Administradores y Profesores) */}
            <Route
              path="/datos-de-curso"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}> {/* Administradores y Profesores */}
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-cursos"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}> {/* Administradores y Profesores */}
                  <CourseListManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preguntas-frecuentes/:courseId"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}> {/* Administradores y Profesores */}
                  <FAQSection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cursos/:courseId/modulos"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}> {/* Administradores y Profesores */}
                  <CourseModulesManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/datos-de-curso/:courseId/modulos/:moduleId/clases"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}> {/* Administradores y Profesores */}
                  <ModuleClassesManager />
                </ProtectedRoute>
              }
            />

            {/* Ruta para Administrador de Categorías (solo Administradores) */}
            <Route
              path="/categorias"
              element={
                <ProtectedRoute allowedRoles={[1]}> {/* Solo Administradores */}
                  <CategoryManager />
                </ProtectedRoute>
              }
            />
          </Routes>
        </LayoutConMenu>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
