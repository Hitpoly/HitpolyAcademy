import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Link,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CursoCard from "../cards/CursoCard";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const AllCategoriesCourses = () => {
  const [categoriesWithCourses, setCategoriesWithCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCourses, setVisibleCourses] = useState({});
  const [instructorNamesMap, setInstructorNamesMap] = useState({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const INITIAL_COURSE_COUNT = 4;

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      setCategoriesWithCourses([]);
      setInstructorNamesMap({});

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

        const fetchedCategories = categoriesData.categorias;

        if (!coursesResponse.ok) {
          const errorText = await coursesResponse.text();
          throw new Error(
            `Error al cargar cursos: ${coursesResponse.statusText}. Detalles: ${errorText}`
          );
        }
        const coursesData = await coursesResponse.json();
        let allFetchedCourses;

        if (
          coursesData.status === "success" &&
          coursesData.cursos &&
          Array.isArray(coursesData.cursos.cursos)
        ) {
          allFetchedCourses = coursesData.cursos.cursos;
        } else if (
          coursesData.status === "success" &&
          Array.isArray(coursesData.cursos)
        ) {
          allFetchedCourses = coursesData.cursos;
        } else {
          throw new Error(
            coursesData.message ||
              "Datos de cursos inválidos: La estructura del array de cursos no es la esperada."
          );
        }

        const publishedCourses = allFetchedCourses.filter(
          (curso) => curso.estado === "Publicado"
        );

        const uniqueInstructorIds = [
          ...new Set(publishedCourses.map((curso) => curso.profesor_id)),
        ].filter((id) => id);

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
        setInstructorNamesMap(newInstructorNamesMap);

        const categorizedCourses = fetchedCategories
          .map((category) => {
            const filteredCourses = publishedCourses.filter(
              (curso) => String(curso.categoria_id) === String(category.id)
            );

            const mappedCourses = filteredCourses.map((curso) => ({
              id: curso.id,
              title: curso.titulo,
              subtitle: curso.subtitulo,
              banner: curso.portada_targeta,
              accessLink: `/curso/${curso.id}`,
              instructorName:
                newInstructorNamesMap[curso.profesor_id] ||
                "Instructor Desconocido",
              totalHours: curso.duracion_estimada,
              price: `${curso.precio} ${curso.moneda}`,
              level: curso.nivel,
              classType: curso.tipo_clase || null,
            }));

            return {
              id: category.id,
              name: category.nombre,
              description: category.descripcion,
              courses: mappedCourses,
            };
          })
          .filter((category) => category.courses.length > 0);

        setCategoriesWithCourses(categorizedCourses);

        const initialVisibleCourses = {};
        categorizedCourses.forEach((category) => {
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
    setVisibleCourses((prev) => {
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
          mt: "80px",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando todas las categorías y cursos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, mt: "80px" }}>
        <Alert severity="error">Error al cargar los datos: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{mt: "10px" }}>
      <Box
        sx={{
          backgroundColor: "#6C4DE2",
          color: "white",
          p: { xs: "40px 20px", md: "60px 100px" },
          mb: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "200px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          Hitpoly | Oportunidad del Día | Capitaliza tu Talento
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            "& span": {
              color: "#EF50BA",
            },
          }}
        >
          Lleva tu talento al <span>siguiente nivel</span> con HitpolyAcademy.
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: "70%", mb: 3, fontSize: "1.3rem" }}
        >
          Conviértete en un profesional digital de alto impacto. Accede a
          programas diseñados para ayudarte a capitalizar en internet y generar
          ingresos sostenibles desde donde estés.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#f21c63",
            color: "white",
            borderRadius: "20px",
            textTransform: "none",
            px: 3,
            py: 1.5,
          }}
        >
          ¡Capitaliza ahora!
        </Button>
      </Box>
      <Box sx={{ mb: 2, p: { xs: "10px 20px", md: "0px 100px" } }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ mb: 0, fontSize: { xs: "1rem", sm: "1.25rem", md: "1.2rem" } }}
        >
          <Box component="span">
            Un aprendizaje potente y flexible es a un solo clic.
          </Box>
          Ya sea que busques mejorar tus habilidades o ampliar tus
          conocimientos,{" "}
          <Box component="span" sx={{ fontWeight: "bold" }}>
            estamos aquí para apoyarte en tu camino
          </Box>
          . Avanza hacia tus metas este año. La oferta es válida hasta el 30 de
          julio de 2025.
          <Link href="#" color="primary" sx={{ textDecoration: "underline" }}>
            Consulte las preguntas frecuentes a continuación para obtener más
            detalles...
          </Link>
        </Typography>
        <Box
          sx={{
            textAlign: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              mb: { xs: 4, md: 4 },
              fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
            }}
          ></Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.125rem", sm: "1.3rem", md: "1.5rem" },
              px: { xs: 1, sm: 2, md: 4 },
              maxWidth: {sx: "90%", md: "70%"},
              mx: "auto",
              lineHeight: 1.5,
            }}
          >
            15% de descuento en cursos, certificados profesionales, XSeries,
            educación ejecutiva, programas MicroMasters® y programas
            MicroBachelors®
          </Typography>
        </Box>
      </Box>

      {categoriesWithCourses.length > 0 ? (
        categoriesWithCourses.map((category) => (
          <Box
            key={category.id}
            sx={{ mb: 6, p: { xs: "10px 20px", md: "50px 100px" } }}
          >
            <Typography
              variant="body1"
              gutterBottom
              sx={{ mb: 1, fontWeight: "bold", fontSize: "1.6rem" }}
            >
              {" "}
              {category.name}
            </Typography>
            {category.description && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, fontSize: "1.3rem" }}
              >
                {category.description}
              </Typography>
            )}

            {category.courses.length > 0 ? (
              <>
                {isSmallScreen ? (
                  <Box
                    sx={{
                      display: "flex",
                      overflowX: "auto",
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
                      <Box
                        key={curso.id}
                        sx={{
                          flexShrink: 0,
                          width: { xs: "80%", sm: "45%", md: "30%" },
                        }}
                      >
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
                  <Grid container spacing={3}>
                    {category.courses
                      .slice(0, visibleCourses[category.id])
                      .map((curso) => (
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

                {!isSmallScreen &&
                  category.courses.length > INITIAL_COURSE_COUNT && (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                      <Typography
                        variant="body1"
                        color="primary"
                        onClick={() =>
                          toggleViewMore(category.id, category.courses.length)
                        }
                        sx={{
                          cursor: "pointer",
                          textDecoration: "underline",
                          "&:hover": {
                            color: "primary.dark",
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
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 4 }}
        >
          No se encontraron categorías o cursos para mostrar.
        </Typography>
      )}

      {/* INICIO DEL CÓDIGO DE PREGUNTAS FRECUENTES - MODIFICADO */}
      <Box
        sx={{
          p: { xs: "10px 20px", md: "50px 100px" },
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "50%" }, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="body1"
            component="h2"
            sx={{ fontWeight: "bold", color: "#6C4DE2", fontSize: "3.5rem" }}
          >
            Preguntas
          </Typography>
          <Typography
            variant="body1"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#6C4DE2",
              fontSize: "3.5rem",
              mt: -2,
            }}
          >
            Frecuentes
          </Typography>
        </Box>

        <Box sx={{ width: { xs: "100%", md: "50%" }, }}>
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography sx={{ fontWeight: "medium" }}>
                ¿Qué tipos de
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  infoproductos
                </Typography>
                y programas son elegibles para el descuento?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                Las ofertas elegibles para el descuento incluyen nuestros
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  infoproductos exclusivos
                </Typography>
                ,
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  programas de certificación digital
                </Typography>
                y
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  rutas de especialización
                </Typography>
                diseñadas por
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  expertos de primer nivel
                </Typography>
                en las carreras digitales más demandadas.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography sx={{ fontWeight: "medium" }}>
                ¿Cómo canjeo el descuento en los{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  infoproductos
                </Typography>
                y
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  programas de certificación
                </Typography>
                de HitpolyAcademy?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                Para canjear tu descuento en nuestros
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  infoproductos y programas digitales
                </Typography>
                , simplemente deberás ingresar el código
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  LEVELUPEDX25
                </Typography>
                al finalizar tu compra directamente en la plataforma de
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  HitpolyAcademy
                </Typography>
                . ¡Así de fácil!
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3a-content"
              id="panel3a-header"
            >
              <Typography sx={{ fontWeight: "medium" }}>
                ¿Este descuento aplica a los
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  programas de desarrollo profesional
                </Typography>
                ?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                Sí, este descuento es válido para la mayoría de nuestros
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  programas de desarrollo profesional y especialización
                </Typography>
                . Te invitamos a revisar los detalles específicos de cada
                programa en nuestra plataforma o contactar a nuestro equipo para
                confirmar la elegibilidad.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4a-content"
              id="panel4a-header"
            >
              <Typography sx={{ fontWeight: "medium" }}>
                Tengo un problema al canjear mi descuento. ¿Cómo puedo obtener
                ayuda?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                ¡Estamos aquí para ayudarte! Si encuentras alguna dificultad al
                canjear tu descuento, por favor, comunícate con nuestro equipo
                de soporte. Puedes encontrarnos en la sección de contacto de
                nuestra web o a través del chat en línea.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 4,
          pt: 2,
          borderTop: "1px solid #e0e0e0",
          p: { xs: "10px 20px", md: "50px 100px" },
          bgcolor: "white",
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Descargo de responsabilidad
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          La oferta es válida hasta el 30 de julio de 2025 a las 23:59, hora del
          este (EE. UU.). No aplica a programas de grado. No se puede combinar
          con otros códigos de descuento. Para canjear la oferta por cursos
          verificados, Certificados Profesionales, XSeries, Programas
          MicroBachelors® y Programas MicroMasters®, usa el código LEVELUPEDX25
          al finalizar la compra en edx.org.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          La oferta de formación ejecutiva es válida para las siguientes
          universidades: SDA Bocconi School of Management, University of
          Cambridge Institute for Sustainability Leadership, Harvard Online, HEC
          Paris, Institute for Management Development, MIT School of
          Architecture and Planning, MIT Sloan School of Management,
          Northwestern University, Rice University, Stanford Center for Health
          Education, London School of Economics and Political Science, UC Davis
          Graduate School of Management, University of Cape Town, University of
          Oxford y University of Toronto. La oferta es válida para cualquier
          fecha de inicio, siempre que se registre y pague antes del 30 de julio
          de 2025. Para canjear la oferta por cursos de formación ejecutiva,
          regístrese en getsmarter.com con el código LEVELUPEDX25 al finalizar
          la compra. El descuento no es acumulable con otras ofertas de cursos
          de formación ejecutiva.
        </Typography>
      </Box>
    </Box>
  );
};

export default AllCategoriesCourses;
