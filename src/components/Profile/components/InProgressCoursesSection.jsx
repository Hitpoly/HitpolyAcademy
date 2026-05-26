import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material"; // Importa useTheme y useMediaQuery
import CourseCard from "../../cards/CourseCardProgress";
import { useAuth } from "../../../context/AuthContext";

const InProgressCoursesSection = ({ showTitle = true }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const currentUserId = isAuthenticated ? user?.id : null;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // ... (logic remains same)
    const fetchUserCoursesAndProgress = async () => {
      setLoading(true);
      setError(null);
      let userEnrolledCourseTitles = [];
      let allFetchedCourses = [];

      try {
        if (currentUserId) {
          const userInfoResponse = await fetch(
            "https://apiacademy.hitpoly.com/ajax/getInfoUserController.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getInfo", id: currentUserId }),
            }
          );

          if (!userInfoResponse.ok) {
            throw new Error(
              `Error HTTP! Estado: ${userInfoResponse.status}. No se pudo obtener información del usuario.`
            );
          }

          const userInfoData = await userInfoResponse.json();

          if (
            userInfoData.status === "success" &&
            userInfoData.cursos &&
            Array.isArray(userInfoData.cursos)
          ) {
            userEnrolledCourseTitles = userInfoData.cursos.map(
              (curso) => curso.titulo
            );
          } else {
            setCourses([]);
            setLoading(false);
            return;
          }
        } else {
          setCourses([]);
          setLoading(false);
          return;
        }

        const coursesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getCursos" }),
          }
        );

        if (!coursesResponse.ok) {
          throw new Error(
            `Error HTTP! Estado: ${coursesResponse.status}. No se pudieron obtener todos los cursos.`
          );
        }

        const coursesData = await coursesResponse.json();

        if (coursesData.status === "success") {
          allFetchedCourses = coursesData.cursos?.cursos || coursesData.cursos || [];
          if (!Array.isArray(allFetchedCourses)) {
             allFetchedCourses = [];
          }
        } else {
          throw new Error(
            coursesData.message ||
              "No se pudieron obtener los cursos de la academia."
          );
        }

        const enrolledCoursesDetails = allFetchedCourses.filter((curso) =>
          userEnrolledCourseTitles.includes(curso.titulo)
        );

        const coursesWithProgress = await Promise.all(
          enrolledCoursesDetails.map(async (curso) => {
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

              if (
                progressData.status === "success" &&
                typeof progressData.porcentaje_avance_curso === "number"
              ) {
                return {
                  ...curso,
                  progreso: progressData.porcentaje_avance_curso,
                  completado:
                    progressData.porcentaje_avance_curso === 100 ? 1 : 0,
                };
              } else {
                return { ...curso, progreso: 0, completado: 0 };
              }
            } catch (progressError) {
              return { ...curso, progreso: 0, completado: 0 };
            }
          })
        );
        setCourses(coursesWithProgress);
      } catch (e) {
        setError(`Error al cargar los cursos: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserCoursesAndProgress();
    } else {
      setCourses([]);
      setLoading(false);
    }
  }, [currentUserId, isAuthenticated]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress sx={{ color: '#f21c63', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Cargando tus cursos y progreso...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {showTitle && (
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontWeight: 800,
            color: "#1c1d1f",
            textAlign: "center",
          }}
        >
          Mis Cursos en Progreso
        </Typography>
      )}

      {courses.length > 0 ? (
        <Grid container spacing={4}>
          {courses.map((curso) => (
            <Grid item key={curso.id} xs={12}>
              <CourseCard
                curso={{
                  id: curso.id,
                  titulo: curso.titulo,
                  subtitulo: curso.subtitulo,
                  portada_targeta: curso.portada_targeta,
                  progreso: curso.progreso,
                  completado: curso.completado,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 8, px: 2, bgcolor: '#f9f9f9', borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aún no tienes cursos en progreso
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Explora nuestra biblioteca y comienza tu camino hoy mismo.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InProgressCoursesSection;
