import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import { Box, Typography, Button, TextField } from "@mui/material";

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
      "Domina las técnicas psicologicas del cosumidor y multiplica tus oportunidades de capitalización tarabajando con empresas internacionales.",
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

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
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
                minHeight: "100vh",
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-start",
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
    </Box>
  );
};

export default PortadaOne;
