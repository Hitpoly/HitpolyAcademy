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

  console.log("CourseModulesManager renderizado.");
  console.log("Estado actual - courseId:", courseId);
  console.log("Estado actual - loading:", loading);
  console.log("Estado actual - error:", error);
  console.log("Estado actual - modules.length:", modules.length);
  console.log("Estado actual - courseTitle:", courseTitle);

  const fetchModulesAndCourseTitle = async () => {
    console.log("Iniciando fetchModulesAndCourseTitle...");
    if (!courseId) {
      console.log("Error: courseId no encontrado en la URL.");
      setLoading(false);
      setError(
        "No se ha seleccionado un curso para gestionar módulos. Vuelve a la lista de cursos."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Obtener los detalles del curso (incluido el título)
      console.log(`Intentando obtener detalles del curso con ID: ${courseId}`);
      console.log("URL de la petición de curso:", "https://apiacademy.hitpoly.com/ajax/traerCursosController.php");
      console.log("Cuerpo de la petición de curso:", JSON.stringify({ accion: "getCursos", id: courseId }));

      const courseResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursos", id: courseId }),
        }
      );

      console.log("Respuesta HTTP cruda del curso:", courseResponse);
      if (!courseResponse.ok) {
        const errorText = await courseResponse.text();
        console.error(`Error HTTP al cargar el curso: ${courseResponse.status} - ${errorText}`);
        throw new Error(`Error HTTP: ${courseResponse.status} - ${errorText}`);
      }

      const courseData = await courseResponse.json();
      console.log("Respuesta de la API de cursos (JSON parseado):", courseData);

      // --- CAMBIO CLAVE AQUÍ ---
      if (courseData.status === "success" && courseData.cursos) {
        let actualCoursesArray = [];
        // Detectar la estructura de la respuesta
        if (Array.isArray(courseData.cursos)) {
          // Caso 1: courseData.cursos es directamente un array de cursos
          console.log("courseData.cursos es un array directamente.");
          actualCoursesArray = courseData.cursos;
        } else if (typeof courseData.cursos === 'object' && courseData.cursos !== null && Array.isArray(courseData.cursos.cursos)) {
          // Caso 2: courseData.cursos es un objeto que contiene un array 'cursos' anidado
          console.log("courseData.cursos es un objeto con un array 'cursos' anidado.");
          actualCoursesArray = courseData.cursos.cursos;
        } else {
            console.error("Formato inesperado para 'cursos' en la respuesta:", courseData.cursos);
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
          console.log("Título del curso establecido:", foundCourse.titulo);
        } else {
          setCourseTitle("Curso no encontrado");
          setError(`No se encontró el curso con ID ${courseId} en la respuesta de la API. Puede que el ID no exista o los datos sean incorrectos.`);
          setLoading(false);
          console.error(
            `Error: Curso con ID ${courseId} no encontrado en el array final de cursos. Contenido del array:`, actualCoursesArray
          );
          return;
        }
      } else {
        setCourseTitle("Curso no encontrado");
        setError(
          courseData.message ||
            "No se pudo cargar la información del curso o el formato de datos es inesperado."
        );
        setLoading(false);
        console.error(
          "Error al cargar la información del curso o formato de datos inesperado:",
          courseData
        );
        return;
      }
      // --- FIN CAMBIO CLAVE ---


      // 2. Cargar los módulos del curso usando el endpoint específico
      console.log(`Intentando obtener módulos para el curso ID: ${courseId} usando el nuevo endpoint.`);
      console.log("URL de la petición de módulos:", "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php");
      console.log("Cuerpo de la petición de módulos:", JSON.stringify({ accion: "getModulosCurso", id: courseId }));

      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php", // <-- Endpoint correcto
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getModulosCurso", id: courseId }), // <-- Parámetros correctos
        }
      );

      console.log("Respuesta HTTP cruda de módulos:", response);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error HTTP al cargar módulos: ${response.status} - ${errorText}`);
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Respuesta de la API de módulos (JSON parseado):", data);

      if (data.status === "success" && Array.isArray(data.modulos)) {
        data.modulos.sort((a, b) => a.orden - b.orden);
        setModules(data.modulos);
        console.log("Módulos cargados y ordenados:", data.modulos);
      } else {
        setError(
          data.message ||
            "Error al cargar los módulos o formato de datos inesperado en la respuesta."
        );
        setModules([]);
        console.error(
          "Error o formato inesperado en la carga de módulos:",
          data.message || data
        );
      }
    } catch (err) {
      setError(`No se pudieron cargar los módulos o el curso: ${err.message}`);
      console.error("Excepción en fetchModulesAndCourseTitle:", err);
    } finally {
      setLoading(false);
      console.log("fetchModulesAndCourseTitle finalizado. Loading:", false);
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
    console.log("handleAddModule: Abriendo formulario para nuevo módulo.");
    setModuleToEdit(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (module) => {
    console.log("handleEditModule: Abriendo formulario para editar módulo:", module.id);
    setModuleToEdit(module);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (moduleId) => {
    console.log("handleDeleteModule: Intentando eliminar módulo:", moduleId);
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este módulo? Se eliminarán todas las clases asociadas."
      )
    ) {
      console.log("Eliminación de módulo cancelada por el usuario.");
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

      console.log("Respuesta HTTP cruda de eliminación de módulo:", response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log("Respuesta de eliminación de módulo (JSON parseado):", data);

      if (data.status === "success") {
        alert("Módulo eliminado exitosamente.");
        setRefreshTrigger((prev) => prev + 1);
        console.log("Módulo eliminado con éxito. Refrescando lista.");
      } else {
        setError(data.message || "Error al eliminar el módulo.");
        console.error("Error al eliminar módulo:", data.message || data);
      }
    } catch (err) {
      setError(`No se pudo eliminar el módulo: ${err.message}`);
      console.error("Excepción al eliminar módulo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleFormClose = () => {
    console.log("handleModuleFormClose: Cerrando formulario de módulo. Refrescando lista.");
    setShowModuleForm(false);
    setModuleToEdit(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleViewClasses = (module) => {
    console.log("handleViewClasses: Navegando a la gestión de clases para el módulo:", module.id);
    navigate(`/datos-de-curso/${courseId}/modulos/${module.id}/clases`, {
      state: { moduleTitle: module.titulo, moduleId: module.id, courseTitle: courseTitle }
    });
  };

  const handleBackToCourses = () => {
    console.log("handleBackToCourses: Navegando a la lista de cursos.");
    navigate("/datos-de-curso");
  };

  if (loading) {
    console.log("Renderizando estado de carga...");
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