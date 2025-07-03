import React, { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";

import { Box, Typography, Button, CircularProgress, Tooltip } from "@mui/material"; // Eliminado TextField ya que no se usa directamente aquí
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Importa el nuevo componente
import EmailSubscriptionForm from "../forms/EmailSubscriptionForm"; // Asegúrate de que la ruta sea correcta

const PortadaOne = () => {
  const swiperRef = useRef(null);
  const navigationNextRef = useRef(null);

  const [slideData, setSlideData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeaturedCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("fetchFeaturedCourses: Iniciando carga de cursos destacados desde la API...");
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/traerCursosDestacadosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursosDestacados" }),
        }
      );

      console.log("fetchFeaturedCourses: Respuesta HTTP recibida:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `fetchFeaturedCourses (ERROR HTTP): La respuesta de la red no fue OK. Estado: ${response.status}, Texto:`,
          errorText
        );
        throw new Error(
          `Error al cargar cursos destacados: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("fetchFeaturedCourses: Datos JSON parseados de la respuesta:", data);

      if (data.status === "success" && Array.isArray(data.cursos)) {
        const formattedSlides = data.cursos.map((curso) => ({
          id: curso.id,
          title: curso.titulo,
          description: curso.subtitulo,
          backgroundImage: curso.portada_targeta,
        }));
        setSlideData(formattedSlides);
        console.log("fetchFeaturedCourses: Cursos destacados cargados y formateados exitosamente.", formattedSlides);
      } else {
        console.error(
          "fetchFeaturedCourses: Formato de respuesta inesperado para cursos destacados. data.status:",
          data.status,
          "Array.isArray(data.cursos):",
          Array.isArray(data.cursos),
          "Mensaje:",
          data.message,
          "Contenido completo de data:",
          data
        );
        throw new Error(
          data.message || "Formato de respuesta de cursos destacados inválido."
        );
      }
    } catch (err) {
      console.error(
        "fetchFeaturedCourses (Catch): Error inesperado durante la carga de cursos destacados:",
        err
      );
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("fetchFeaturedCourses: Proceso de carga finalizado. Loading: false.");
    }
  }, []);

  useEffect(() => {
    fetchFeaturedCourses();
  }, [fetchFeaturedCourses]);

  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.params &&
      navigationNextRef.current
    ) {
      swiperRef.current.params.navigation = {
        ...swiperRef.current.params.navigation,
        nextEl: navigationNextRef.current,
      };
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [slideData]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: "rgba(0, 0, 0, 0.85)", color: "white" }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando cursos destacados...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: "rgba(0, 0, 0, 0.85)", color: "white", p: 3 }}
      >
        <Typography color="error" variant="h6" textAlign="center">
          Error al cargar los cursos destacados: {error}
        </Typography>
        <Button onClick={fetchFeaturedCourses} variant="contained" sx={{ mt: 2 }}>
          Reintentar
        </Button>
      </Box>
    );
  }

  if (slideData.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: "rgba(0, 0, 0, 0.85)", color: "white" }}
      >
        <Typography variant="h6">No hay cursos destacados disponibles en este momento.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        "@keyframes arrow-pulse-move": {
          "0%": { opacity: 0.4, transform: "translate(0, -50%)" },
          "50%": { opacity: 1, transform: "translate(10px, -50%)" },
          "100%": { opacity: 0.4, transform: "translate(0, -50%)" },
        },
      }}
    >
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={800}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {slideData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Box
              sx={{
                height: "100vh",
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: {
                  xs: "center 20%",
                  sm: "center 30%",
                  md: "center",
                },
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  zIndex: 1,
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  backgroundColor: "rgba(255,255,255,0.85)",
                  padding: { xs: 2.5, md: 5 },
                  borderRadius: 2,
                  maxWidth: { xs: "100%", sm: 400, md: 600 },
                  width: { xs: "100%", sm: "auto" },
                  textAlign: { xs: "center", sm: "left" },
                  mb: { xs: 10, md: 12 },
                  ml: { xs: 2, md: 8 },
                  mr: { xs: 2, md: 0 },
                }}
              >
                {/* Título con límite de líneas y Tooltip */}
                <Tooltip title={slide.title} placement="top">
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                      color: "#333",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2, // ¡CAMBIO AQUÍ: de 3 a 2 líneas!
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: "1.2em",
                      minHeight: "2.4em", // Ajustar minHeight para 2 líneas (1.2em * 2)
                    }}
                  >
                    {slide.title}
                  </Typography>
                </Tooltip>

                {/* Subtítulo con límite de líneas y Tooltip */}
                {slide.description && (
                  <Tooltip title={slide.description} placement="bottom">
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        color: "#555",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: "1.4em",
                        minHeight: "4.2em",
                      }}
                    >
                      {slide.description}
                    </Typography>
                  </Tooltip>
                )}

                {/* Pasamos slide.id como prop */}
                <EmailSubscriptionForm idCursoDestacado={slide.id} />

              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Flecha de navegación derecha personalizada */}
      <Box
        ref={navigationNextRef}
        sx={{
          position: "absolute",
          top: {xs: "35%", md: "50%"},
          right: { xs: "5px", md: "20px" },
          transform: "translateY(-50%)",
          zIndex: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "arrow-pulse-move 2s infinite ease-in-out",
          color: "white",
          "& svg": {
            fontSize: { xs: "25px", md: "35px" },
          },
          "&:hover": {
            opacity: 1,
            transform: "translate(10px, -50%)",
          },
        }}
      >
        <ArrowForwardIosIcon />
      </Box>
    </Box>
  );
};

export default PortadaOne;