import React, { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";

import { Box, Typography, Button, CircularProgress, Tooltip } from "@mui/material"; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EmailSubscriptionForm from "../forms/EmailSubscriptionForm"; 

const PortadaOne = () => {
  const swiperRef = useRef(null);
  const navigationNextRef = useRef(null);

  const [slideData, setSlideData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shouldStopAutoplay, setShouldStopAutoplay] = useState(false);

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
        const formattedSlides = data.cursos.map((curso) => ({
          id: curso.id,
          title: curso.titulo,
          description: curso.subtitulo,
          backgroundImage: curso.url_banner,
        }));
        setSlideData(formattedSlides);
      } else {
        throw new Error(
          data.message || "Formato de respuesta de cursos destacados inválido."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedCourses();
  }, [fetchFeaturedCourses]);

  // Aseguramos la vinculación de la navegación cuando los datos cargan
  useEffect(() => {
    if (swiperRef.current && navigationNextRef.current) {
      swiperRef.current.params.navigation.nextEl = navigationNextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [slideData]);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      if (shouldStopAutoplay) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
    }
  }, [shouldStopAutoplay]);

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
          pauseOnMouseEnter: false,
        }}
        // CONFIGURACIÓN CLAVE PARA LA FLECHA
        navigation={{
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.nextEl = navigationNextRef.current;
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
                      WebkitLineClamp: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: "1.2em",
                      minHeight: "2.4em", 
                    }}
                  >
                    {slide.title}
                  </Typography>
                </Tooltip>
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
                <EmailSubscriptionForm idCursoDestacado={slide.id} onInputActivity={setShouldStopAutoplay} />
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* FLECHA CON Z-INDEX CORREGIDO */}
      <Box
        ref={navigationNextRef}
        sx={{
          position: "absolute",
          top: {xs: "35%", md: "50%"},
          right: { xs: "5px", md: "20px" },
          transform: "translateY(-50%)",
          zIndex: 100, // Aumentado para estar por encima de los slides
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "arrow-pulse-move 2s infinite ease-in-out",
          color: "white",
          pointerEvents: "auto", // Asegura que capture el clic
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