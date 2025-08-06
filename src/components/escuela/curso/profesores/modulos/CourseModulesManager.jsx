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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ModuleCard from "./ModuleCard";
import ModuleForm from "./ModuleForm";

// Endpoints proporcionados
const API_GET_CURSOS = "https://apiacademy.hitpoly.com/ajax/traerCursosController.php";
const API_GET_MODULOS = "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php";
const API_ELIMINAR_MODULO = "https://apiacademy.hitpoly.com/ajax/eliminarModulosController.php";
const API_GET_EXAMEN = "https://apiacademy.hitpoly.com/ajax/getExamenController.php";

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
  const [examInfo, setExamInfo] = useState(null); 
  const [examExists, setExamExists] = useState(false);

  // LÓGICA CORREGIDA para traer el examen
  const fetchExamByCourseId = async () => {
    try {
      const response = await fetch(API_GET_EXAMEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "getExamen" }),
      });
      if (!response.ok) {
        throw new Error("Error al obtener los exámenes.");
      }
      const data = await response.json();
      
      // LOG: Imprime la respuesta completa de la API en la consola
      console.log('Respuesta de la API de exámenes:', data);
      console.log('ID del curso actual (courseId):', courseId);
      
      if (data.status === "success" && data.examenes && Array.isArray(data.examenes)) {
        const foundExam = data.examenes.find(exam => String(exam.curso_id) === String(courseId));
        if (foundExam) {
          setExamInfo(foundExam);
          setExamExists(true);
        } else {
          setExamInfo(null);
          setExamExists(false);
        }
      } else {
        setExamInfo(null);
        setExamExists(false);
      }
    } catch (err) {
      console.error("Error al obtener el examen:", err);
      setExamInfo(null);
      setExamExists(false);
    }
  };

  const fetchModulesAndCourseTitle = async () => {
    if (!courseId) {
      setLoading(false);
      setError("No se ha seleccionado un curso para gestionar módulos. Vuelve a la lista de cursos.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const courseResponse = await fetch(API_GET_CURSOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "getCursos", id: courseId }),
      });

      if (!courseResponse.ok) {
        throw new Error(`Error HTTP: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();
      
      let actualCoursesArray = [];
      if (courseData.status === "success" && courseData.cursos) {
        if (Array.isArray(courseData.cursos)) {
          actualCoursesArray = courseData.cursos;
        } else if (courseData.cursos.cursos && Array.isArray(courseData.cursos.cursos)) {
          actualCoursesArray = courseData.cursos.cursos;
        }
      }
      
      const foundCourse = actualCoursesArray.find(c => String(c.id) === String(courseId));
      
      if (foundCourse) {
        setCourseTitle(foundCourse.titulo);
      } else {
        setCourseTitle("Curso no encontrado");
        setError("No se pudo cargar la información del curso. Formato de datos inesperado o ID no encontrado.");
      }

      await fetchExamByCourseId();

      const response = await fetch(API_GET_MODULOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "getModulosCurso", id: courseId }),
      });
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.modulos)) {
        data.modulos.sort((a, b) => a.orden - b.orden);
        setModules(data.modulos);
      } else {
        setError(data.message || "Error al cargar los módulos.");
        setModules([]);
      }
    } catch (err) {
      setError(`No se pudieron cargar los módulos o el curso: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    if (!window.confirm("¿Estás seguro de que quieres eliminar este módulo? Se eliminarán todas las clases asociadas.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ELIMINAR_MODULO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "delete", id: moduleId }),
      });

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

  const handleExamAction = () => {
    if (examExists) {
      navigate(`/cursos/${courseId}/editar-examen/${examInfo.id}`);
    } else {
      navigate(`/cursos/${courseId}/crear-examen`);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="outlined" onClick={handleBackToCourses}>
          ← Volver a la Lista de Cursos
        </Button>
        <Button
          variant="contained"
          color={examExists ? 'info' : 'primary'}
          onClick={handleExamAction}
          startIcon={examExists ? <EditIcon /> : <AddIcon />}
        >
          {examExists ? 'Editar Examen' : 'Crear Examen'}
        </Button>
      </Box>
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