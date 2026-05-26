import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Link, // Asegúrate de que Link esté importado
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CursoCard from "../cards/CursoCard";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";


  const AllCategoriesCourses = () => {
const [categoriesWithCourses, setCategoriesWithCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCourses, setVisibleCourses] = useState({});
  const [instructorNamesMap, setInstructorNamesMap] = useState({});
  const [filterPrice, setFilterPrice] = useState([0, 1000]);
  const [filterCategory, setFilterCategory] = useState("Todas");

  const location = useLocation();
  const isOfferMonth = location.pathname === "/oferta-del-mes";

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const INITIAL_COURSE_COUNT = 4;

  // Scroll to top on route change to ensure the page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      setCategoriesWithCourses([]);
      setInstructorNamesMap({});

      try {
        const [categoriesResponse, coursesResponse] = await Promise.all([
          fetch(
            "https://apiacademy.hitpoly.com/ajax/GetCategoriasController.php",
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

        const categorizedCourses = (await Promise.all(
          fetchedCategories.map(async (category) => {
            let filteredCourses = publishedCourses.filter(
              (curso) => String(curso.categoria_id) === String(category.id)
            );

            // Si estamos en /oferta-del-mes, solo mostramos cursos con oferta
            if (isOfferMonth) {
              filteredCourses = filteredCourses.filter(curso => 
                !!curso.oferta && (parseFloat(curso.oferta.precio_oferta) > 0 || parseFloat(curso.oferta.descuento) > 0)
              );
            }

            const mappedCourses = await Promise.all(
              filteredCourses.map(async (curso) => {
                try {
                  const valRes = await fetch(
                    `https://apiacademy.hitpoly.com/ajax/valoracionesController.php?accion=getResumen&curso_id=${curso.id}`
                  );
                  const valData = await valRes.json();

                  return {
                    id: curso.id,
                    title: curso.titulo,
                    subtitle: curso.subtitulo,
                    banner: curso.portada_targeta,
                    videoUrl: curso.url_video_introductorio,
                    accessLink: `/curso/${curso.id}`,
                    instructorName:
                      newInstructorNamesMap[curso.profesor_id] ||
                      "Instructor Academia",
                    totalHours: curso.duracion_estimada,
                    priceValue: parseFloat(curso.precio) || 0,
                    price: `${curso.precio} ${curso.moneda}`,
                    rating: valData.status === "success" ? valData.rating : 0,
                    reviews: valData.status === "success" ? valData.reviews : 0,
                    level: curso.nivel,
                    classType: curso.tipo_clase || null,
                    oferta: curso.oferta,
                    hasOffer: !!curso.oferta && (parseFloat(curso.oferta.precio_oferta) > 0 || parseFloat(curso.oferta.descuento) > 0),
                    students: curso.total_estudiantes || 0
                  };
                } catch (err) {
                  return {
                    id: curso.id,
                    title: curso.titulo,
                    subtitle: curso.subtitulo,
                    banner: curso.portada_targeta,
                    videoUrl: curso.url_video_introductorio,
                    accessLink: `/curso/${curso.id}`,
                    instructorName:
                      newInstructorNamesMap[curso.profesor_id] ||
                      "Instructor Academia",
                    totalHours: curso.duracion_estimada,
                    priceValue: parseFloat(curso.precio) || 0,
                    price: `${curso.precio} ${curso.moneda}`,
                    rating: 0,
                    reviews: 0,
                    level: curso.nivel,
                    classType: curso.tipo_clase || null,
                    oferta: curso.oferta,
                    hasOffer: !!curso.oferta && (parseFloat(curso.oferta.precio_oferta) > 0 || parseFloat(curso.oferta.descuento) > 0),
                    students: curso.total_estudiantes || 0
                  };
                }
              })
            );

            return {
              id: category.id,
              name: category.nombre,
              description: category.descripcion,
              courses: mappedCourses,
            };
          })
        )).filter((category) => category.courses.length > 0);

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
    <Box>
      <Box
        sx={{
          backgroundColor: "#2D1638",
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
            fontSize: {xs: "2.5rem", md: "3rem"},
            fontWeight: "bold",
            "& span": {
              color: "#f21c63",
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
          component="a"
          href="#cursos-oferta"
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
          . Avanza hacia tus metas este año. La oferta es válida hasta finalizar el mes {" "}
          {/* CAMBIO AQUÍ: El href apunta al ID de la sección de FAQ */}
          <Link href="#preguntas-frecuentes" color="primary" sx={{ textDecoration: "underline" }}>
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

          {/* Texto dinámico de descuento */}
          {(() => {
            // Recopilar todos los descuentos activos
            const discounts = [];
            categoriesWithCourses.forEach(cat => {
              cat.courses.forEach(curso => {
                if (curso.hasOffer && curso.oferta) {
                  const d = parseFloat(curso.oferta.descuento);
                  if (!isNaN(d) && d > 0) discounts.push(d);
                  else if (curso.oferta.precio_oferta && curso.priceValue > 0) {
                    const pct = Math.round(((curso.priceValue - parseFloat(curso.oferta.precio_oferta)) / curso.priceValue) * 100);
                    if (pct > 0) discounts.push(pct);
                  }
                }
              });
            });

            const categoriesWithOffers = categoriesWithCourses
              .filter(cat => cat.courses.some(c => c.hasOffer))
              .map(cat => cat.name);

            if (discounts.length === 0) return null;

            const minDiscount = Math.min(...discounts);
            const maxDiscount = Math.max(...discounts);
            const discountText = minDiscount === maxDiscount
              ? `${minDiscount}% de descuento`
              : `desde ${minDiscount}% hasta ${maxDiscount}% de descuento`;

            const categoryText = categoriesWithOffers.length > 0
              ? `en ${categoriesWithOffers.join(', ')}`
              : 'en todos nuestros cursos';

            // Recopilar fechas de expiración de ofertas
            const expiryDates = [];
            categoriesWithCourses.forEach(cat => {
              cat.courses.forEach(curso => {
                if (curso.hasOffer && curso.oferta && curso.oferta.fecha_fin) {
                  const d = new Date(curso.oferta.fecha_fin);
                  if (!isNaN(d.getTime())) expiryDates.push(d);
                }
              });
            });
            let expiryLabel = '';
            if (expiryDates.length > 0) {
              const earliest = new Date(Math.min(...expiryDates.map(d => d.getTime())));
              expiryLabel = `Oferta válida hasta el ${earliest.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
            }

            return (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.125rem", sm: "1.3rem", md: "1.5rem" },
                    px: { xs: 1, sm: 2, md: 4 },
                    maxWidth: { xs: "90%", md: "70%" },
                    mx: "auto",
                    lineHeight: 1.5,
                    mb: 1,
                  }}
                >
                  <Box component="span" sx={{ color: "#f21c63" }}>{discountText}</Box>{" "}{categoryText}.
                  {/* Agregamos descripción de productos */}
                  <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                    Incluye cursos, certificados profesionales, series, educación ejecutiva, programas Masters y MicroMasters.
                  </Box>
                </Typography>
                {expiryLabel && (
                  <Typography variant="body2" color="text.secondary" sx={{ mx: "auto", maxWidth: { xs: "90%", md: "70%" } }}>
                    {expiryLabel}
                  </Typography>
                )}
              </>
            );
          })()}
        </Box>
      </Box>

      <div id="cursos-oferta">
      
      {/* Filtro Bar para /oferta-del-mes */}
      {isOfferMonth && (
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
            p: 2,
            mb: 4,
            mx: { xs: 2, md: 12 },
            borderRadius: 2,
            border: "1px solid #e0e0e0"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: "fit-content" }}>
            <FilterListIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Filtrar por:</Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              label="Categoría"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="Todas">Todas las categorías</MenuItem>
              {categoriesWithCourses.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ width: 220, px: 2 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              Rango de Precio: ${filterPrice[0]} - ${filterPrice[1] === 1000 ? "1000+" : filterPrice[1]}
            </Typography>
            <Slider
              value={filterPrice}
              onChange={(e, newValue) => setFilterPrice(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              size="small"
              sx={{ color: "#f21c63", mt: 1 }}
            />
          </Box>
        </Paper>
      )}

      {isOfferMonth ? (
        (() => {
          let allFilteredCourses = [];
          categoriesWithCourses.forEach((category) => {
             if (filterCategory !== "Todas" && String(category.id) !== String(filterCategory)) return;
             category.courses.forEach(curso => {
                let finalPriceValue = curso.priceValue;
                if (curso.hasOffer && curso.oferta) {
                  if (curso.oferta.precio_oferta && parseFloat(curso.oferta.precio_oferta) > 0) {
                    finalPriceValue = parseFloat(curso.oferta.precio_oferta);
                  } else if (curso.oferta.descuento && parseFloat(curso.oferta.descuento) > 0) {
                    finalPriceValue = curso.priceValue - (curso.priceValue * (parseFloat(curso.oferta.descuento) / 100));
                  }
                }
                if (finalPriceValue >= filterPrice[0] && (filterPrice[1] >= 1000 ? true : finalPriceValue <= filterPrice[1])) {
                   allFilteredCourses.push(curso);
                }
             });
          });
          // Ordenar por número de inscritos (students) descendente
          allFilteredCourses.sort((a, b) => (b.students || 0) - (a.students || 0));

          return allFilteredCourses.length > 0 ? (
            <Box sx={{ p: { xs: "10px 20px", md: "20px 100px" }, mb: 6 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Mostrando <strong>{allFilteredCourses.length}</strong> cursos en oferta
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "flex-start" }}>
                {allFilteredCourses.map((curso) => (
                  <Box
                    key={curso.id}
                    sx={{
                      width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.33% - 16px)", lg: "calc(25% - 18px)" },
                      flex: "0 0 auto",
                    }}
                  >
                    <CursoCard {...curso} />
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4, mb: 6 }}>
               No se encontraron ofertas que coincidan con los filtros.
            </Typography>
          );
        })()
      ) : categoriesWithCourses.length > 0 ? (
        categoriesWithCourses.map((category) => {
          return (
          <Box
            key={category.id}
            sx={{ ml: 2, mb: 6, p: { xs: "10px 0px", md: "50px 100px" } }}
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
                      gap: 2,
                      "&::-webkit-scrollbar": {
                        height: "8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "10px",
                      },
                    }}
                  >
                    {category.courses.map((curso) => (
                      <Box
                        key={curso.id}
                        sx={{
                          flexShrink: 0,
                          width: "280px", // Ancho fijo para móvil, igual que en las secciones
                        }}
                      >
                        <CursoCard
                          {...curso}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 3,
                      justifyContent: "flex-start",
                    }}
                  >
                      {category.courses.slice(
                        0,
                        visibleCourses[category.id] || INITIAL_COURSE_COUNT
                      )
                      .map((curso) => (
                        <Box
                          key={curso.id}
                          sx={{
                            width: { xs: "280px", sm: "300px", md: "320px" },
                            flex: "0 0 auto",
                          }}
                        >
                          <CursoCard {...curso} />
                        </Box>
                      ))}
                  </Box>
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
        );
      })
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 4 }}
        >
          {isOfferMonth ? "No hay ofertas disponibles en este momento." : "No se encontraron categorías o cursos para mostrar."}
        </Typography>
      )}
      </div>

      {/* INICIO DEL CÓDIGO DE PREGUNTAS FRECUENTES - MODIFICADO */}
      <Box
        id="preguntas-frecuentes"
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
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="body1"
            component="h2"
            sx={{ fontWeight: "bold", color: "#2D1638", fontSize: "3.5rem" }}
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

        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography sx={{ fontWeight: "medium" }}>
                ¿Qué tipos de{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  infoproductos
                </Typography>{" "}
                y programas son elegibles para el descuento?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                Las ofertas elegibles para el descuento incluyen nuestros{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  infoproductos exclusivos
                </Typography>
                ,{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  programas de certificación digital
                </Typography>{" "}
                y{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  rutas de especialización
                </Typography>{" "}
                diseñadas por{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  expertos de primer nivel
                </Typography>{" "}
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
                </Typography>{" "}
                y{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  programas de certificación
                </Typography>{" "}
                de HitpolyAcademy?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                Para canjear tu descuento en nuestros{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  infoproductos y programas digitales
                </Typography>
                , simplemente deberás pinchar en el enlace{" "}
                {/* Aquí está el cambio: Envolver el código en un Link */}
                <Link
                  href="https://wa.me/51977990496" // Reemplaza con la URL real donde se aplica el descuento
                  target="_blank" // Abre el enlace en una nueva pestaña
                  rel="noopener noreferrer" // Mejora la seguridad
                  sx={{ fontWeight: "bold", textDecoration: "underline" }} // Estilos para que parezca un enlace subrayado y en negrita
                >
                  PINCHA AQUI PARA OBTENER LA OFERTA,
                </Link>{" "}
                para finalizar tu compra directamente en{" "}
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
                ¿Este descuento aplica a los{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  programas de desarrollo profesional
                </Typography>{" "}
                ?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                Sí, este descuento es válido para la mayoría de nuestros{" "}
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
          La promoción es válida hasta el 30 de julio de 2025 a las 23:59 (hora
          de Lima, Perú). Esta oferta no aplica a programas académicos
          universitarios ni puede combinarse con otras promociones o descuentos
          activos.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Hitpoly no es una universidad ni una institución educativa
          tradicional. Somos una plataforma de capitalización digital
          independiente. Para acceder a esta promoción, es necesario comunicarse
          directamente con nuestro equipo a través de los canales oficiales. No
          se requiere el uso de ningún código de descuento en el sitio web. La
          oferta está sujeta a disponibilidad y puede modificarse sin previo
          aviso.
        </Typography>
      </Box>
    </Box>
  );
};

export default AllCategoriesCourses;