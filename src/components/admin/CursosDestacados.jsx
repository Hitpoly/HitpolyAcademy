import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";

const CursosDestacados = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursos" }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al cargar todos los cursos: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.cursos.cursos)) {
        setCourses(data.cursos.cursos);
      } else {
        throw new Error(
          data.message || "Formato de respuesta de todos los cursos inválido."
        );
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error al cargar todos los cursos",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/traerCursosDestacadosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursosDestacados" }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al cargar cursos destacados: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.cursos)) {
        setCourses(data.cursos);
      } else {
        throw new Error(
          data.message || "Formato de respuesta de cursos destacados inválido."
        );
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error al cargar cursos destacados",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteCourse = async (courseId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/eliminarCursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accion: "delete",
              id: courseId,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error al eliminar curso: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const data = await response.json();

        if (data.status === "success") {
          Swal.fire("¡Eliminado!", "El curso ha sido eliminado.", "success");
          fetchAllCourses();
        } else {
          throw new Error(data.message || "Fallo al eliminar el curso.");
        }
      } catch (err) {
        Swal.fire(
          "Error",
          `No se pudo eliminar el curso: ${err.message}`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleFeatured = async (courseId, currentFeaturedStatus) => {
    const newFeaturedStatus = currentFeaturedStatus === 1 ? 0 : 1;
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? { ...course, destacado: newFeaturedStatus }
          : course
      )
    );

    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/editarCursoAdminController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "updateCursoAdmin",
            id: courseId,
            destacado: newFeaturedStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === courseId
              ? { ...course, destacado: currentFeaturedStatus }
              : course
          )
        );
        throw new Error(
          `Error al actualizar destacado: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
      } else {
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === courseId
              ? { ...course, destacado: currentFeaturedStatus }
              : course
          )
        );
        throw new Error(
          data.message || "Fallo al actualizar el estado de destacado."
        );
      }
    } catch (err) {
      Swal.fire(
        "Error",
        `No se pudo actualizar el estado de destacado: ${err.message}`,
        "error"
      );
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando cursos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
        <Button onClick={fetchAllCourses} variant="contained" sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Box>
    );
  }

  if (courses.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography variant="h6">No hay cursos disponibles.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Cursos
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre del Curso</TableCell>
              <TableCell>Subtítulo / Descripción Corta</TableCell>
              <TableCell align="center">Destacado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow
                key={course.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {course.id}
                </TableCell>
                <TableCell>{course.titulo}</TableCell>
                <TableCell>
                  {typeof course.subtitulo === "string" &&
                  course.subtitulo.length > 100
                    ? `${course.subtitulo.substring(0, 100)}...`
                    : course.subtitulo || "Sin subtítulo"}
                </TableCell>
                <TableCell align="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={course.destacado === 1}
                        onChange={() =>
                          handleToggleFeatured(course.id, course.destacado)
                        }
                        name={`destacado-${course.id}`}
                        color="primary"
                      />
                    }
                    label={course.destacado === 1 ? "Sí" : "No"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CursosDestacados;