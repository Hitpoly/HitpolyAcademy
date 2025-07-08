import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material"; 
import { useNavigate, useLocation } from "react-router-dom";
import CourseStatusManager from "./cursosCardsProfesor/CourseStatusManager"; 

const CourseListManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [forceRefreshCourseList, setForceRefreshCourseList] = useState(0);

  useEffect(() => {
    if (location.state?.shouldRefresh) {
      setForceRefreshCourseList((prev) => prev + 1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleEditCourseFromList = (cursoRecibido) => {  
    navigate("/datos-de-curso", { state: { courseToEdit: cursoRecibido } });
  };

  const handleCreateNewCourse = () => {
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
        mx: "auto",
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

      <CourseStatusManager
        onEditCourse={handleEditCourseFromList} 
        refreshTrigger={forceRefreshCourseList} 
      />
    </Box>
  );
};

export default CourseListManager;