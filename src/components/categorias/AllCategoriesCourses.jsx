import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  // Ya no necesitamos Button aquí
} from "@mui/material";
import CursoCard from "../cards/CursoCard";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const mockInstructorNames = {
  1: "Juan Pérez",
  2: "María García",
  3: "Profesor Delgado",
  4: "Ana López",
  // Agrega más según tus necesidades si tienes más IDs de profesor
};

const AllCategoriesCourses = () => {
  const [categoriesWithCourses, setCategoriesWithCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCourses, setVisibleCourses] = useState({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const INITIAL_COURSE_COUNT = 4;

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      setCategoriesWithCourses([]);

      try {
        const categoriesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getcategorias" }),
          }
        );

        if (!categoriesResponse.ok) {
          throw new Error(`Error al cargar categorías: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.status !== "success" || !Array.isArray(categoriesData.categorias)) {
          throw new Error(categoriesData.message || "Datos de categorías inválidos.");
        }

        const fetchedCategories = categoriesData.categorias;

        const coursesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getCursos" }),
          }
        );

        if (!coursesResponse.ok) {
          throw new Error(`Error al cargar cursos: ${coursesResponse.statusText}`);
        }
        const coursesData = await coursesResponse.json();
        let allFetchedCourses;

        if (coursesData.status === "success" && coursesData.cursos && Array.isArray(coursesData.cursos.cursos)) {
          allFetchedCourses = coursesData.cursos.cursos;
        } else if (coursesData.status === "success" && Array.isArray(coursesData.cursos)) {
          allFetchedCourses = coursesData.cursos;
        } else {
          throw new Error(coursesData.message || "Datos de cursos inválidos: La estructura del array de cursos no es la esperada.");
        }

        const categorizedCourses = fetchedCategories.map(category => {
          const filteredCourses = allFetchedCourses.filter(
            (curso) =>
              String(curso.categoria_id) === String(category.id) &&
              curso.estado === "Publicado"
          );

          const mappedCourses = filteredCourses.map(curso => ({
            id: curso.id,
            title: curso.titulo,
            subtitle: curso.subtitulo,
            banner: curso.portada_targeta,
            accessLink: `/curso/${curso.id}`,
            instructorName: mockInstructorNames[curso.profesor_id] || "Instructor Desconocido",
            totalHours: curso.duracion_estimada,
            price: `${curso.precio} ${curso.moneda}`,
            level: curso.nivel,
            classType: curso.tipo_clase || null,
          }));

          return {
            id: category.id,
            name: category.nombre,
            courses: mappedCourses,
          };
        }).filter(category => category.courses.length > 0);

        setCategoriesWithCourses(categorizedCourses);

        const initialVisibleCourses = {};
        categorizedCourses.forEach(category => {
          initialVisibleCourses[category.id] = INITIAL_COURSE_COUNT;
        });
        setVisibleCourses(initialVisibleCourses);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const toggleViewMore = (categoryId, totalCourses) => {
    setVisibleCourses(prev => {
      const currentVisible = prev[categoryId] || INITIAL_COURSE_COUNT;
      if (currentVisible === totalCourses || currentVisible > totalCourses) {
        return {
          ...prev,
          [categoryId]: INITIAL_COURSE_COUNT,
        };
      } else {
        return {
          ...prev,
          [categoryId]: totalCourses,
        };
      }
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 80px)",
          mt: '80px',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando todas las categorías y cursos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, mt: '80px' }}>
        <Alert severity="error">
          Error al cargar los datos: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: '10px' }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Explora Todos Nuestros Cursos por Categoría
      </Typography>

      {categoriesWithCourses.length > 0 ? (
        categoriesWithCourses.map((category) => (
          <Box key={category.id} sx={{ mb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              {category.name}
            </Typography>
            {category.courses.length > 0 ? (
              <>
                {isSmallScreen ? (
                  <Box
                    sx={{
                      display: 'flex',
                      overflowX: 'auto',
                      gap: theme.spacing(2),
                      pb: 2,
                      "&::-webkit-scrollbar": {
                        height: "8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: theme.palette.background.paper,
                      },
                    }}
                  >
                    {category.courses.map((curso) => (
                      <Box key={curso.id} sx={{ flexShrink: 0, width: { xs: '80%', sm: '45%', md: '30%' } }}>
                        <CursoCard
                          title={curso.title}
                          subtitle={curso.subtitle}
                          banner={curso.banner}
                          accessLink={curso.accessLink}
                          instructorName={curso.instructorName}
                          totalHours={curso.totalHours}
                          price={curso.price}
                          level={curso.level}
                          classType={curso.classType}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Grid
                    container
                    spacing={3}
                    justifyContent="center"
                  >
                    {category.courses.slice(0, visibleCourses[category.id]).map((curso) => (
                      <Grid item key={curso.id} xs={12} sm={6} md={4} lg={3}>
                        <CursoCard
                          title={curso.title}
                          subtitle={curso.subtitle}
                          banner={curso.banner}
                          accessLink={curso.accessLink}
                          instructorName={curso.instructorName}
                          totalHours={curso.totalHours}
                          price={curso.price}
                          level={curso.level}
                          classType={curso.classType}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Texto clicable "Ver más" / "Ver menos" para pantallas grandes */}
                {!isSmallScreen && category.courses.length > INITIAL_COURSE_COUNT && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography
                      variant="body1" // Puedes ajustar el variante (h6, subtitle1, etc.)
                      color="primary" // Color del tema de Material UI
                      onClick={() => toggleViewMore(category.id, category.courses.length)}
                      sx={{
                        cursor: 'pointer', // Indica que es clicable
                        textDecoration: 'underline', // Subrayado para indicar que es un enlace/botón de texto
                        '&:hover': {
                          color: 'primary.dark', // Un color más oscuro al pasar el ratón
                        },
                      }}
                    >
                      {visibleCourses[category.id] === INITIAL_COURSE_COUNT
                        ? `Ver todos los ${category.courses.length} cursos de ${category.name}`
                        : `Ver menos cursos de ${category.name}`}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No se encontraron cursos publicados para esta categoría.
              </Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          No se encontraron categorías o cursos para mostrar.
        </Typography>
      )}
    </Box>
  );
};

export default AllCategoriesCourses;