import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Inicio from "./pages/inicio/home";
import PaginaDeInformacion from "./components/paginasDeInformacion/PageInfo";
import LayoutConMenu from "./components/layout/LayoutConMenu";
import PasosIniciales from "./components/escuela/curso/masterFull/primerosPasos";
import Login from "./components/login/page";
import Register from "./components/register/page";
import { AuthProvider, useAuth } from "./context/AuthContext";
import UserProfile from "./components/Profile/UserProfile";
import ExamComponent from "./pages/examenes/ExamComponent";
import ExamResults from "./pages/examenes/ExamResults";
import CourseForm from "./components/escuela/curso/profesores/CourseForm";
import CategoryManager from "./components/escuela/curso/components/categorias/CategoryManager";
import CourseModulesManager from "./components/escuela/curso/profesores/modulos/CourseModulesManager";
import ModuleClassesManager from "./components/escuela/curso/profesores/clases/ModuleClassesManager";
import CourseListManager from "./components/escuela/curso/profesores/CourseListManager";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LayoutConMenu title="General">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/curso/:id" element={<PaginaDeInformacion />} />

            {/* ***** CAMBIO AQUÍ: La ruta /master-full ahora espera un ID de curso ***** */}
            <Route
              path="/master-full/:courseId" // <-- Agrega :courseId
              element={
                <ProtectedRoute>
                  <PasosIniciales />
                </ProtectedRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            {/* Mantén la ruta /register que puede o no tener el :id */}
            <Route path="/register" element={<Register />} />
            <Route path="/curso/:id/register" element={<Register />} /> {/* Esta ruta es la que te permite pasar el ID */}


            <Route path="/exam/:examName" element={<ExamComponent />} />
            <Route path="/exam-results" element={<ExamResults />} />

            {/* RUTAS DE ADMINISTRACIÓN DE CURSOS */}
            <Route
              path="/datos-de-curso"
              element={
                <ProtectedRoute>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-cursos"
              element={
                <ProtectedRoute>
                  <CourseListManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias"
              element={
                <ProtectedRoute>
                  <CategoryManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cursos/:courseId/modulos"
              element={<CourseModulesManager />}
            />
            <Route
              path="/datos-de-curso/:courseId/modulos/:moduleId/clases"
              element={<ModuleClassesManager />}
            />
          </Routes>
        </LayoutConMenu>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;