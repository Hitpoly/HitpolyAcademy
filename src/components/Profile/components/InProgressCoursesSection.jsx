import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, CircularProgress, Alert, useTheme, useMediaQuery } from "@mui/material"; // Importa useTheme y useMediaQuery
import CourseCard from "../../cards/CourseCardProgress";
import { useAuth } from "../../../context/AuthContext";

const InProgressCoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const currentUserId = isAuthenticated ? user?.id : null;

  const theme = useTheme(); // Hook para acceder al tema
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Definir punto de ruptura para una columna

  useEffect(() => {
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

        if (
          coursesData.status === "success" &&
          coursesData.cursos &&
          Array.isArray(coursesData.cursos.cursos)
        ) {
          allFetchedCourses = coursesData.cursos.cursos;
        } else {
          throw new Error(
            coursesData.message ||
            "No se encontraron cursos o el formato de 'traerCursosController' es incorrecto."
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
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Cargando tus cursos y su progreso...
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
        p: { xs: 3, md: "10px 10px" },
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
        Mis Cursos en Progreso
      </Typography>
      {/* CAMBIO CLAVE: Usamos Box con Flexbox en lugar de Stack */}
      {courses.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap", // Permite que las tarjetas se envuelvan a la siguiente fila
            gap: theme.spacing(3), // Espacio entre las tarjetas
            justifyContent: isSmallScreen ? "center" : "flex-start", // Centra en pantallas pequeñas, alinea a la izquierda en grandes
          }}
        >
          {courses.map((curso) => (
            <Box
              key={curso.id}
              sx={{
                width: isSmallScreen ? "100%" : "calc(50% - 1.5 * 8px)", // 50% para dos columnas, restamos el gap (3 * 8px = 24px total, dividido entre 2 tarjetas es 12px por tarjeta, o 1.5 * 8px por tarjeta)
                // Para simplificar, puedes usar width: { xs: "100%", sm: "calc(50% - 12px)" } si el gap es fijo
                minWidth: { xs: "280px", sm: "auto" }, // Asegura un ancho mínimo para la tarjeta
                flexGrow: 1, // Permite que la tarjeta crezca si hay espacio adicional
              }}
            >
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
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No estás inscrito en ningún curso en progreso.
        </Typography>
      )}
    </Box>
  );
};

export default InProgressCoursesSection;