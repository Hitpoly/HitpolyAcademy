// src/components/modulos/CourseModulesManager.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import ModuleCard from "./ModuleCard";
import ModuleForm from "./ModuleForm";

const CourseModulesManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [courseTitle, setCourseTitle] = useState("");


  const fetchModulesAndCourseTitle = async () => {
    if (!courseId) {
      setLoading(false);
      setError(
        "No se ha seleccionado un curso para gestionar módulos. Vuelve a la lista de cursos."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      
      const courseResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursos", id: courseId }),
        }
      );

      if (!courseResponse.ok) {
        const errorText = await courseResponse.text();
        throw new Error(`Error HTTP: ${courseResponse.status} - ${errorText}`);
      }

      const courseData = await courseResponse.json();
      if (courseData.status === "success" && courseData.cursos) {
        let actualCoursesArray = [];
        if (Array.isArray(courseData.cursos)) {
          actualCoursesArray = courseData.cursos;
        } else if (typeof courseData.cursos === 'object' && courseData.cursos !== null && Array.isArray(courseData.cursos.cursos)) {
          actualCoursesArray = courseData.cursos.cursos;
        } else {
            setCourseTitle("Curso no encontrado");
            setError("No se pudo cargar la información del curso. Formato de datos inesperado.");
            setLoading(false);
            return;
        }

        const foundCourse = actualCoursesArray.find(
          (c) => String(c.id) === String(courseId)
        );
        
        if (foundCourse) {
          setCourseTitle(foundCourse.titulo);
          } else {
          setCourseTitle("Curso no encontrado");
          setError(`No se encontró el curso con ID ${courseId} en la respuesta de la API. Puede que el ID no exista o los datos sean incorrectos.`);
          setLoading(false);
          return;
        }
      } else {
        setCourseTitle("Curso no encontrado");
        setError(
          courseData.message ||
            "No se pudo cargar la información del curso o el formato de datos es inesperado."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php", // <-- Endpoint correcto
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getModulosCurso", id: courseId }), // <-- Parámetros correctos
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.status === "success" && Array.isArray(data.modulos)) {
        data.modulos.sort((a, b) => a.orden - b.orden);
        setModules(data.modulos);
        } else {
        setError(
          data.message ||
            "Error al cargar los módulos o formato de datos inesperado en la respuesta."
        );
        setModules([]);
      }
    } catch (err) {
      setError(`No se pudieron cargar los módulos o el curso: ${err.message}`);
      } finally {
      setLoading(false);
      }
  };

  useEffect(() => {
    console.log(
      "useEffect activado. courseId:",
      courseId,
      "refreshTrigger:",
      refreshTrigger
    );
    fetchModulesAndCourseTitle();
  }, [courseId, refreshTrigger]);

  const handleAddModule = () => {
    setModuleToEdit(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (module) => {
    setModuleToEdit(module);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (moduleId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este módulo? Se eliminarán todas las clases asociadas."
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/eliminarModulosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "delete", id: moduleId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (data.status === "success") {
        alert("Módulo eliminado exitosamente.");
        setRefreshTrigger((prev) => prev + 1);
        } else {
        setError(data.message || "Error al eliminar el módulo.");
        }
    } catch (err) {
      setError(`No se pudo eliminar el módulo: ${err.message}`);
      } finally {
      setLoading(false);
    }
  };

  const handleModuleFormClose = () => {
    setShowModuleForm(false);
    setModuleToEdit(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleViewClasses = (module) => {
    navigate(`/datos-de-curso/${courseId}/modulos/${module.id}/clases`, {
      state: { moduleTitle: module.titulo, moduleId: module.id, courseTitle: courseTitle }
    });
  };

  const handleBackToCourses = () => {
    navigate("/mis-cursos");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, mt: 2 }}>
          Cargando módulos y detalles del curso...
        </Typography>
      </Box>
    );
  }

  const existingOrders = modules.map((module) => module.orden);

  return (
    <Box sx={{ p: 2, backgroundColor: "white", boxShadow: 3, flexGrow: 1 }}>
      <Button variant="outlined" onClick={handleBackToCourses} sx={{ mb: 2 }}>
        ← Volver a la Lista de Cursos
      </Button>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Módulos para el Curso: {courseTitle || `ID: ${courseId}`}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Button variant="contained" onClick={handleAddModule} sx={{ mb: 3 }}>
        Añadir Nuevo Módulo
      </Button>

      <ModuleForm
        courseId={courseId}
        moduleToEdit={moduleToEdit}
        open={showModuleForm}
        onClose={handleModuleFormClose}
        onModuleSaved={handleModuleFormClose}
        existingOrders={existingOrders}
      />

      {modules.length === 0 && !showModuleForm && !error ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No hay módulos registrados para este curso. ¡Añade uno!
        </Typography>
      ) : (
        <Grid container spacing={2} direction="column">
          {modules.map((module) => (
            <Grid item key={module.id} xs={12}>
              <ModuleCard
                module={module}
                onEdit={handleEditModule}
                onDelete={handleDeleteModule}
                onViewClasses={handleViewClasses}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CourseModulesManager;