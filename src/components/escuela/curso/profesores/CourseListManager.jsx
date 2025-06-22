// components/escuela/curso/profesores/CourseListManager.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material"; // Agregué Button para el "Crear Curso"
import { useNavigate, useLocation } from "react-router-dom";
import CourseStatusManager from "./cursosCardsProfesor/CourseStatusManager"; // Asegúrate de que esta ruta sea correcta

const CourseListManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [forceRefreshCourseList, setForceRefreshCourseList] = useState(0);

  // Efecto para verificar si se debe refrescar la lista al entrar a esta ruta
  // Esto ocurre cuando se viene de CourseForm después de una operación de submit exitosa
  useEffect(() => {
    if (location.state?.shouldRefresh) {
      setForceRefreshCourseList((prev) => prev + 1);
      // Limpiar el estado de la ubicación para evitar refrescos innecesarios
      // y para que al refrescar la página no se recargue la lista de nuevo automáticamente
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Manejador para el botón de editar en CourseStatusManager
  const handleEditCourseFromList = (cursoRecibido) => {
    // Navegar a la misma ruta del formulario, pero pasando el curso como estado de la navegación
    navigate("/datos-de-curso", { state: { courseToEdit: cursoRecibido } });
  };

  // Manejador para el botón de "Crear Nuevo Curso"
  const handleCreateNewCourse = () => {
    // Navegar a la ruta del formulario sin ningún estado de edición
    navigate("/datos-de-curso");
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "white",
        boxShadow: 3,
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "900px",
        mx: "auto",
        my: 4,
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        align="center"
        sx={{ mb: 3 }}
      >
        Gestionar Cursos Existentes
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateNewCourse}
        sx={{ mb: 3 }}
      >
        Crear Nuevo Curso
      </Button>

      {/* CourseStatusManager es el componente que muestra la lista de cursos */}
      <CourseStatusManager
        onEditCourse={handleEditCourseFromList} // Pasa el manejador de edición
        refreshTrigger={forceRefreshCourseList} // Usa este trigger para forzar el refresco
      />
    </Box>
  );
};

export default CourseListManager;