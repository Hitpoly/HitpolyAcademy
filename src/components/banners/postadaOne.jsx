import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";

import { Box, Typography, Button, TextField } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const slideData = [
  {
    id: 1,
    title: "Máster Full: Setter de Élite internacional.",
    description:
      "Conviértete en un Setter de Élite, genera ganancias mientras aprendes y asegura un empleo 100% remoto, con empresas de nivel internacional.",
    backgroundImage: "/images/Appointment1.jpg",
  },
  {
    id: 2,
    title: "Máster Full: Closer de Ventas Especializado.",
    description:
      "Domina las técnicas psicológicas del consumidor y multiplica tus oportunidades de capitalización trabajando con empresas internacionales.",
    backgroundImage: "/images/Appointment4.jpg",
  },
  {
    id: 3,
    title: "Máster Full: Desarrollo Web con IA (Avanzado)",
    description:
      "Aprende a construir soluciones web innovadoras con Inteligencia Artificial y trabaja con empresas de nivel Internacional.",
    backgroundImage: "/images/Appointment2.jpg",
  },
];

const PortadaOne = () => {
  const swiperRef = useRef(null);
  const navigationNextRef = useRef(null);

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
  }, []);

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
                backgroundPosition: "center",
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
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                    color: "#333",
                  }}
                >
                  {slide.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    color: "#555",
                  }}
                >
                  {slide.description}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mt: 2,
                    alignItems: { xs: "stretch", sm: "flex-start" },
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <TextField
                    label="Tu correo electrónico"
                    variant="outlined"
                    type="email"
                    size="small"
                    sx={{
                      flexGrow: 1,
                      maxWidth: { xs: "100%", sm: 250 },
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      backgroundColor: "#F21C63",
                      minWidth: { xs: "100%", sm: "auto" },
                    }}
                  >
                    Regístrate ahora
                  </Button>
                </Box>
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
