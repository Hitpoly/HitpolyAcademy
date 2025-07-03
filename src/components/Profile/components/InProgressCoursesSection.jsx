import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, CircularProgress, Alert } from "@mui/material";
import CourseCard from "../../cards/CourseCardProgress";
import { useAuth } from "../../../context/AuthContext";

const InProgressCoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const currentUserId = isAuthenticated ? user?.id : null;

  useEffect(() => {
    const fetchAllCoursesAndProgress = async () => {
      setLoading(true);
      setError(null);
      let fetchedCourses = [];

      try {
        const coursesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getCursos" }),
          }
        );

        if (!coursesResponse.ok) {
          throw new Error(`Error HTTP! Estado: ${coursesResponse.status}`);
        }

        const coursesData = await coursesResponse.json();

        if (
          coursesData.status === "success" &&
          coursesData.cursos &&
          Array.isArray(coursesData.cursos.cursos)
        ) {
          fetchedCourses = coursesData.cursos.cursos;
        } else {
          throw new Error(
            coursesData.message ||
              "No se encontraron cursos o el formato es incorrecto."
          );
        }

        if (currentUserId) {
          const coursesWithProgress = await Promise.all(
            fetchedCourses.map(async (curso) => {
              try {
                const progressResponse = await fetch(
                  "https://apiacademy.hitpoly.com/ajax/actualizarPorcentajeVistoController.php",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      accion: "avance_curso",
                      id: currentUserId,
                      curso_id: curso.id,
                    }),
                  }
                );

                const progressData = await progressResponse.json();

                console.log(
                  `Respuesta bruta de avance para curso ID ${curso.id}:`,
                  progressData
                );

                // --- CAMBIO CLAVE AQUÍ: Usar 'porcentaje_avance_curso' en lugar de 'porcentaje_visto' ---
                if (
                  progressData.status === "success" &&
                  typeof progressData.porcentaje_avance_curso === "number" // ¡Corregido!
                ) {
                  return {
                    ...curso,
                    progreso: progressData.porcentaje_avance_curso, // ¡Corregido!
                    completado: progressData.porcentaje_avance_curso === 100 ? 1 : 0, // ¡Corregido!
                  };
                } else {
                  console.warn(
                    `No se pudo obtener el avance para el curso ID ${curso.id}: Formato de respuesta inválido o datos inesperados.`,
                    progressData.message || ""
                  );
                  return { ...curso, progreso: 0, completado: 0 };
                }
              } catch (progressError) {
                console.error(
                  `Error al obtener el progreso del curso ID ${curso.id}:`,
                  progressError
                );
                return { ...curso, progreso: 0, completado: 0 };
              }
            })
          );
          setCourses(coursesWithProgress);
        } else {
          setCourses(
            fetchedCourses.map((curso) => ({
              ...curso,
              progreso: 0,
              completado: 0,
            }))
          );
        }
      } catch (e) {
        console.error("Error al cargar los cursos o su progreso:", e);
        setError(`Error al cargar los cursos: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCoursesAndProgress();
  }, [currentUserId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Cargando cursos y su progreso...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        flex: { xs: "0 0 100%", md: "100%" },
        mb: { xs: 3, md: 0 },
        maxHeight: "100%",
        p: { xs: 3, md: 4 },
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
        Todos los Cursos Disponibles
      </Typography>
      <Stack spacing={3}>
        {courses.length > 0 ? (
          courses.map((curso) => (
            <CourseCard
              key={curso.id}
              curso={{
                id: curso.id,
                titulo: curso.titulo,
                subtitulo: curso.subtitulo,
                portada_targeta: curso.portada_targeta,
                progreso: curso.progreso,
                completado: curso.completado,
              }}
            />
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            No hay cursos disponibles en este momento.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default InProgressCoursesSection;