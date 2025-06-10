// src/components/modulos/CourseModulesManager.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Asegúrate de importar useNavigate
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
// import ModuleClassesManager from "../clases/ModuleClassesManager"; // Ya no lo importamos aquí directamente para renderizarlo

const CourseModulesManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate(); // Hook para la navegación

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // const [selectedModule, setSelectedModule] = useState(null); // Ya no lo necesitamos aquí para renderizar la gestión de clases
  const [courseTitle, setCourseTitle] = useState("");

  console.log("CourseModulesManager renderizado.");
  console.log("Estado actual - courseId:", courseId);
  console.log("Estado actual - loading:", loading);
  console.log("Estado actual - error:", error);
  console.log("Estado actual - modules.length:", modules.length);
  console.log("Estado actual - courseTitle:", courseTitle);
  // console.log("Estado actual - selectedModule:", selectedModule); // Ya no necesitamos este log

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
      const courseResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursos", id: courseId }),
        }
      );
      const courseData = await courseResponse.json();
      console.log("Respuesta de la API de cursos:", courseData);

      if (courseData.status === "success" && Array.isArray(courseData.cursos)) {
        const foundCourse = courseData.cursos.find(
          (c) => String(c.id) === String(courseId)
        );

        if (foundCourse) {
          setCourseTitle(foundCourse.titulo);
          console.log("Título del curso establecido:", foundCourse.titulo);
        } else {
          setCourseTitle("Curso no encontrado");
          setError(`No se encontró el curso con ID ${courseId}.`);
          setLoading(false);
          console.error(
            `Error: Curso con ID ${courseId} no encontrado en la respuesta.`
          );
          return;
        }
      } else {
        setCourseTitle("Curso no encontrado");
        setError(
          courseData.message ||
            "No se pudo cargar la información del curso o formato inesperado."
        );
        setLoading(false);
        console.error(
          "Error al cargar la información del curso o formato de datos inesperado:",
          courseData
        );
        return;
      }

      // 2. Cargar los módulos del curso
      console.log(`Intentando obtener módulos para el curso ID: ${courseId}`);
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/getModulosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getModulos", curso_id: courseId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Respuesta de la API de módulos:", data);

      if (data.status === "success" && Array.isArray(data.modulos)) {
        const filtered = data.modulos.filter(
          (mod) => String(mod.curso_id) === String(courseId)
        );
        filtered.sort((a, b) => a.orden - b.orden);
        setModules(filtered);
        console.log("Módulos cargados y filtrados:", filtered);
      } else {
        setError(
          data.message ||
            "Error al cargar los módulos o formato de datos inesperado."
        );
        setModules([]);
        console.error(
          "Error o formato inesperado en la carga de módulos:",
          data.message
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
    setModuleToEdit(null); // Asegura que el formulario esté en modo "crear"
    setShowModuleForm(true); // Abre el modal
  };

  const handleEditModule = (module) => {
    console.log("handleEditModule: Abriendo formulario para editar módulo:", module.id);
    setModuleToEdit(module); // Pasa el módulo a editar al formulario
    setShowModuleForm(true); // Abre el modal
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log("Respuesta de eliminación de módulo:", data);

      if (data.status === "success") {
        alert("Módulo eliminado exitosamente.");
        setRefreshTrigger((prev) => prev + 1);
        console.log("Módulo eliminado con éxito. Refrescando lista.");
      } else {
        setError(data.message || "Error al eliminar el módulo.");
        console.error("Error al eliminar módulo:", data.message);
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
    setShowModuleForm(false); // Cierra el modal
    setModuleToEdit(null); // Resetea el módulo a editar
    setRefreshTrigger((prev) => prev + 1); // Fuerza un refresco de la lista de módulos
  };

  // MODIFICACIÓN CLAVE AQUÍ: Navegar a una nueva ruta
  const handleViewClasses = (module) => {
    console.log("handleViewClasses: Navegando a la gestión de clases para el módulo:", module.id);
    // Usamos navigate para ir a una nueva URL, pasando el id del módulo
    navigate(`/datos-de-curso/${courseId}/modulos/${module.id}/clases`, {
      state: { moduleTitle: module.titulo, moduleId: module.id, courseTitle: courseTitle }
    });
  };

  const handleBackToCourses = () => {
    console.log("handleBackToCourses: Navegando a la lista de cursos.");
    navigate("/datos-de-curso");
  };

  // Esta sección se ELIMINA, ya que ModuleClassesManager se renderizará en su propia ruta
  // if (selectedModule) {
  //   console.log("Renderizando ModuleClassesManager para módulo:", selectedModule.id);
  //   return (
  //     <ModuleClassesManager module={selectedModule} onBack={handleBackToModules} />
  //   );
  // }

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