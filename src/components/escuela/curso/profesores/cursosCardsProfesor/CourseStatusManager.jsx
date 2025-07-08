// src/components/CourseStatusManager.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CourseCardEstado from "../../../../cards/CourseCardEstado";
import useCourseData from "./useCourseData";

const CourseStatusManager = ({
  onEditCourse,
  refreshTrigger: propRefreshTrigger,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(false); 

  const {
    allCourses,
    loading,
    error,
    categorias,
    loadingCategories,
    dynamicEstadosDisponibles,
    setAllCourses,
    setError,
  } = useCourseData(propRefreshTrigger || localRefreshTrigger); 

  useEffect(() => {
    let tempCourses = [...allCourses];

    if (selectedCategory) {
      tempCourses = tempCourses.filter(
        (
          item 
        ) =>
          item.curso &&
          String(item.curso.categoria_id) === String(selectedCategory)
      );
    }

    if (selectedStatus) {
      tempCourses = tempCourses.filter((item) => {
        const courseEstadoNormalizado =
          item.curso && String(item.curso.estado).trim().toLowerCase();
        const selectedStatusNormalizado = String(selectedStatus)
          .trim()
          .toLowerCase();
        return courseEstadoNormalizado === selectedStatusNormalizado;
      });
    }
    setFilteredCourses(tempCourses);
  }, [allCourses, selectedCategory, selectedStatus]); 

  const handleEditClick = (course) => {
    onEditCourse(course);
  };

  const handleStatusChange = async (courseId, newStatus) => {
    let originalCourse = null;
    setAllCourses((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.curso && item.curso.id === courseId) {
          originalCourse = { ...item }; 
          return { ...item, curso: { ...item.curso, estado: newStatus } }; 
        }
        return item;
      });
      return updatedItems;
    });

    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/editarCursoController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "update",
            id: courseId,
            estado: newStatus,
            fecha_actualizacion:
              new Date().toISOString().slice(0, 10) +
              " " +
              new Date().toTimeString().slice(0, 8),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        } else {
        setError(data.message || "Error al cambiar el estado del curso."); // Revertir el estado si la operación falla en el backend
        setAllCourses((prevItems) =>
          prevItems.map(
            (item) =>
              item.curso && item.curso.id === courseId ? originalCourse : item // Revertir el item completo
          )
        );
      }
    } catch (err) {
      setError(`No se pudo actualizar el estado: ${err.message}`); // Revertir el estado
      setAllCourses((prevItems) =>
        prevItems.map(
          (item) =>
            item.curso && item.curso.id === courseId ? originalCourse : item // Revertir el item completo
        )
      );
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setError(null);
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
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setAllCourses((prevItems) => {
          const remainingItems = prevItems.filter(
            (item) => item.curso && item.curso.id !== courseId
          );
          return remainingItems;
        });
        alert("Curso eliminado exitosamente.");
      } else {
        setError(data.message || "Error al eliminar el curso.");
      }
    } catch (err) {
      setError(`No se pudo eliminar el curso: ${err.message}`);
    }
  };

  const handleRefresh = () => {
    setLocalRefreshTrigger((prev) => !prev);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  if (loadingCategories) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando categorías...
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
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
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={handleRefresh} variant="contained" sx={{ mt: 2 }}>
          Reintentar Carga de Cursos
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          width: "100%",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="category-filter-label">Categoría</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter-select"
            value={selectedCategory}
            label="Categoría"
            onChange={handleCategoryChange}
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Estado</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter-select"
            value={selectedStatus}
            label="Estado"
            onChange={handleStatusFilterChange}
          >
            {dynamicEstadosDisponibles.map((estado) => (
              <MenuItem key={estado.value} value={estado.value}>
                {estado.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button onClick={handleRefresh} variant="outlined">
          Refrescar Cursos
        </Button>
      </Box>
      {filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: "center", p: 3 }}>
          <Typography variant="h6">
            No hay cursos disponibles con los filtros seleccionados.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {filteredCourses.map((item) => (
            <Grid item key={item.curso.id} xs={12} sm={6} md={6} lg={4}>
              <CourseCardEstado
                course={item}
                onStatusChange={handleStatusChange}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteCourse}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CourseStatusManager;