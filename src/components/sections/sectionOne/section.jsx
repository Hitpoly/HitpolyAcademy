import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import CursoCard from "../../../components/cards/CursoCard";

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

const SectionCardGrid = () => {
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Añadido: Estado para almacenar los nombres de los profesores
  const [instructorNamesMap, setInstructorNamesMap] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [categoriesResponse, coursesResponse] = await Promise.all([
          fetch(
            "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getcategorias" }),
            }
          ),
          fetch(
            "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getCursos" }),
            }
          ),
        ]);

        // --- Procesamiento de Categorías ---
        if (!categoriesResponse.ok) {
          const errorText = await categoriesResponse.text();
          throw new Error(
            `Error al cargar categorías: ${categoriesResponse.statusText}. Detalles: ${errorText}`
          );
        }
        const categoriesData = await categoriesResponse.json();
        if (
          categoriesData.status !== "success" ||
          !Array.isArray(categoriesData.categorias)
        ) {
          throw new Error(
            categoriesData.message || "Datos de categorías inválidos."
          );
        }

        // --- Procesamiento de Cursos ---
        if (!coursesResponse.ok) {
          const errorText = await coursesResponse.text();
          throw new Error(
            `Error al cargar cursos: ${coursesResponse.statusText}. Detalles: ${errorText}`
          );
        }
        const coursesData = await coursesResponse.json();
        // LOG: Datos brutos de los cursos recibidos de la API

        // Verificación de la estructura de coursesData
        if (
          coursesData.status !== "success" ||
          !coursesData.cursos ||
          !Array.isArray(coursesData.cursos.cursos)
        ) {
          throw new Error(
            coursesData.message ||
              "Datos de cursos inválidos: la propiedad 'cursos' no es un array en la ubicación esperada."
          );
        }

        const categoryMap = categoriesData.categorias.reduce((map, cat) => {
          map[cat.id] = cat.nombre;
          return map;
        }, {});

        const publishedCourses = coursesData.cursos.cursos.filter(
          (curso) => curso.estado === "Publicado"
        );
        // LOG: Cursos filtrados que están publicados
        

        // --- Recolectar IDs de profesores únicos y cargar sus nombres ---
        const uniqueInstructorIds = [
          ...new Set(publishedCourses.map((curso) => curso.profesor_id)),
        ];
        const instructorPromises = uniqueInstructorIds.map(async (id) => {
          try {
            const instructorResponse = await fetch(
              "https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "getAlumnoProfesor", id: id }),
              }
            );
            if (!instructorResponse.ok) {
              
              return { id, name: "Instructor Desconocido" };
            }
            const instructorData = await instructorResponse.json();
            if (instructorData.status === "success" && instructorData.usuario) {
              return {
                id,
                name: `${instructorData.usuario.nombre} ${instructorData.usuario.apellido}`,
              };
            } else {
              
              return { id, name: "Instructor Desconocido" };
            }
          } catch (fetchErr) {
            
            return { id, name: "Instructor Desconocido" };
          }
        });

        const resolvedInstructors = await Promise.all(instructorPromises);
        const newInstructorNamesMap = resolvedInstructors.reduce(
          (map, instructor) => {
            map[instructor.id] = instructor.name;
            return map;
          },
          {}
        );
        setInstructorNamesMap(newInstructorNamesMap); // Guarda el mapa de nombres de profesores
        // LOG: Mapa final de nombres de instructores

        const organizedCourses = publishedCourses.reduce((acc, curso) => {
          const categoryName =
            categoryMap[curso.categoria_id] || "Sin Categoría";

          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }

          const mappedCourse = {
            id: curso.id,
            title: curso.titulo,
            subtitle: curso.subtitulo,
            banner: curso.portada_targeta,
            accessLink: `/curso/${createSlug(curso.titulo)}-${curso.id}`, // Usar createSlug para el link
            // Utiliza el mapa de nombres de profesores aquí
            instructorName:
              newInstructorNamesMap[curso.profesor_id] ||
              "Instructor Desconocido",
            rating: curso.valoracion || null, // Asumiendo que 'valoracion' es el campo del rating
            reviews: curso.numero_resenas || null, // Asumiendo que 'numero_resenas' es el campo de reviews
            students: curso.total_estudiantes || null, // Asumiendo que 'total_estudiantes' es el campo de estudiantes
            totalHours: curso.duracion_estimada,
            price: `${curso.precio} ${curso.moneda}`,
            level: curso.nivel || null, // Asumiendo que 'nivel' es el campo de nivel
          };

          
          acc[categoryName].push(mappedCourse);
          return acc;
        }, {});

        setCoursesByCategory(organizedCourses);

        if (Object.keys(organizedCourses).length > 0) {
          const firstCategory = Object.keys(organizedCourses)[0];
          setActiveCategoryName(firstCategory);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryNames = useMemo(
    () => Object.keys(coursesByCategory),
    [coursesByCategory]
  );

  const currentCourses = useMemo(
    () =>
      activeCategoryName ? coursesByCategory[activeCategoryName] || [] : [],
    [activeCategoryName, coursesByCategory]
  );

  const coursesToDisplay = useMemo(() => {
    if (isMobile) return currentCourses;
    return isExpanded ? currentCourses : currentCourses.slice(0, 4);
  }, [isMobile, isExpanded, currentCourses]);

  const handleToggleView = (event) => {
    event.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handleCategoryChange = (category) => {
    setActiveCategoryName(category);
    if (!isMobile) {
      setIsExpanded(false);
    }
  };

  const CARD_CONTENT_WIDTH_XS = 280;
  const CARD_MARGIN_XS = 8;

  return (
    <Box>
      <Typography variant="h3" pb={4} pt={3}>
        Las mejores habilidades en tendencia
      </Typography>
      <Box
        sx={{
          width: "100%",
          border: "1px solid #ddd",
          borderRadius: "12px",
          backgroundColor: "#ffff",
          paddingBottom: "30px",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
              flexDirection: "column",
            }}
          >
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando cursos y categorías...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Botones de Categoría */}
            <Box
              sx={{ display: "flex", width: "100%", mb: 4, overflowX: "auto" }}
            >
              {categoryNames.map((category) => (
                <Button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  sx={{
                    flexShrink: 0,
                    minWidth: { xs: "120px", sm: "150px", md: "auto" },
                    flex: { xs: "none", md: "0 0 25%" },
                    maxWidth: { xs: "none", md: "25%" },
                    boxSizing: "border-box",
                    textTransform: "capitalize",
                    borderRadius: "0px",
                    backgroundColor:
                      activeCategoryName === category ? "#6F4CE0" : "#fff",
                    color: activeCategoryName === category ? "#fff" : "#6F4CE0",
                    border: "1px solid #6F4CE0",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor:
                        activeCategoryName === category ? "#5a3ecc" : "#f0f0f0",
                    },
                  }}
                >
                  {category}
                </Button>
              ))}
            </Box>

            {/* Contenedor de Tarjetas de Cursos */}
            <Box
              sx={{
                overflowX: { xs: "auto", md: "visible" },
                display: "flex",
                justifyContent: "flex-start",
                width: "100%",
                paddingBottom: "40px",
                paddingX: { xs: `${CARD_MARGIN_XS}px`, md: 0 },
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: { xs: "nowrap", md: "wrap" },
                  justifyContent: "flex-start",
                  gap: { xs: 3, md: 0 },
                  margin: { xs: "0px", md: "0 3px" },
                  width: { xs: "auto", md: "100%" },
                  minWidth: {
                    xs: `${
                      coursesToDisplay.length *
                      (CARD_CONTENT_WIDTH_XS + CARD_MARGIN_XS * 2)
                    }px`,
                    md: "100%",
                  },
                }}
              >
                {coursesToDisplay.length > 0 ? (
                  coursesToDisplay.map((course) => (
                    <Box
                      key={course.id}
                      sx={{
                        mb: 2,
                        width: {
                          xs: `${CARD_CONTENT_WIDTH_XS}px`,
                          sm: "calc(50% - 16px)",
                          md: "calc(33.33% - 16px)",
                          lg: "calc(25% - 16px)",
                        },
                        flexShrink: 0,
                        margin: `0 ${CARD_MARGIN_XS}px 16px ${CARD_MARGIN_XS}px`,
                      }}
                    >
                      <CursoCard {...course} />
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ width: "100%", textAlign: "center", mt: 4 }}
                  >
                    No hay cursos disponibles en esta categoría.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Botón Ver Más/Menos */}
            {!isMobile && currentCourses.length > 4 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <Link
                  href="#"
                  onClick={handleToggleView}
                  underline="hover"
                  sx={{ color: "#4285F4", fontWeight: "bold" }}
                >
                  {isExpanded
                    ? "Ver menos cursos"
                    : `Ver toda la educación de ${activeCategoryName} en tendencia`}
                </Link>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default SectionCardGrid;