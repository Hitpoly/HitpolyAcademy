import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Importa Navigate
import React from "react"; // Necesario para la función del componente
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
import CourseModulesManager from "./components/escuela/curso/profesores/modulos/CourseModulesManager"
import ModuleClassesManager from "./components/escuela/curso/profesores/clases/ModuleClassesManager"
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
            // Después:
            <Route path="/curso/:id" element={<PaginaDeInformacion />} />{" "}
            <Route
              path="/master-full"
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
            <Route path="/register" element={<Register />} />
            <Route path="/exam/:examName" element={<ExamComponent />} />
            <Route path="/exam-results" element={<ExamResults />} />
            <Route path="/datos-de-curso" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
            <Route path="/categorias" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
            <Route path="/cursos/:courseId/modulos" element={<CourseModulesManager />} />
            <Route path="/datos-de-curso/:courseId/modulos/:moduleId/clases" element={<ModuleClassesManager />} />
          </Routes>
        </LayoutConMenu>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
