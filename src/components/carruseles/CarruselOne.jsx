import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const CarouselWithSwiper = () => {
  const swiperRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isHovered, setIsHovered] = useState({});
  const [tooltipOpen, setTooltipOpen] = useState({});

  useEffect(() => {
    const fetchAlumnos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getAllUserController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getAllUser" }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error HTTP! Estado: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.clases)) {
          // Primero, filtrar solo los usuarios activos
          const activeUsers = data.clases.filter(
            (user) => user.estado === "Activo"
          );

          // >>> CAMBIO CLAVE AQUÍ: Filtrar usuarios que SÍ tienen url_foto_perfil y luego mapear
          const usersWithImages = activeUsers.filter(
            (user) => user.url_foto_perfil // Solo si url_foto_perfil NO es null, undefined o cadena vacía
          );

          const processedUsers = usersWithImages.map((user) => ({
            id: user.id,
            nombre: user.nombre || "Nombre no disponible",
            img: user.url_foto_perfil, // Ya no necesitamos el fallback aquí
            linkedin: user.url_linkedin || "",
          }));

          setAlumnos(processedUsers);
        } else {
          throw new Error(
            data.message ||
            "No se encontraron datos de usuarios o el formato es incorrecto."
          );
        }
      } catch (err) {
        setError(`No se pudieron cargar los usuarios: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnos();
  }, []);

  const handleMouseEnter = (idx) => {
    setIsHovered((prev) => ({ ...prev, [idx]: true }));
    if (alumnos[idx] && alumnos[idx].nombre) {
      setTooltipOpen((prev) => ({ ...prev, [idx]: true }));
    }
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
    }
  };

  const handleMouseLeave = (idx) => {
    setIsHovered((prev) => ({ ...prev, [idx]: false }));
    setTooltipOpen((prev) => ({ ...prev, [idx]: false }));
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando usuarios para el carrusel...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Se añadió un mensaje específico si no hay alumnos después del filtro
  if (alumnos.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No hay usuarios activos con imágenes de perfil disponibles para mostrar en el carrusel.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "90%" },
          padding: { xs: "20px 0", md: "20px 0 0px 0" },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Swiper
          modules={[Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          loop={true}
          spaceBetween={10}
          centeredSlides={true}
          slidesPerView={isMobile ? 3 : 5}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false,
            reverseDirection: true,
          }}
          breakpoints={{
            1024: { slidesPerView: 5 },
            768: { slidesPerView: 3 },
            640: { slidesPerView: 3 },
          }}
        >
          {alumnos.map((alumno, idx) => (
            <SwiperSlide
              key={alumno.id || idx}
              style={{
                padding: "20px 0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Tooltip
                title={alumno.nombre || "Nombre Desconocido"}
                placement="bottom"
                arrow
                open={tooltipOpen?.[idx] || false}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <Box
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={() => handleMouseLeave(idx)}
                  sx={{
                    position: "relative",
                    borderRadius: "50%",
                    overflow: "hidden",
                    width: { xs: "70px", md: "100px" },
                    height: { xs: "70px", md: "100px" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      cursor: "pointer",
                      "& .avatar-overlay": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Avatar
                    src={alumno.img}
                    alt={alumno.nombre || `alumno-${idx}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <Box
                    className="avatar-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      opacity: isHovered?.[idx] ? 1 : 0,
                      transition: "opacity 0.3s ease-in-out",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isHovered?.[idx] && alumno.linkedin && (
                      <IconButton
                        href={alumno.linkedin}
                        target="_blank"
                        color="inherit"
                        size="small"
                      >
                        <LinkedInIcon
                          sx={{
                            color: "white",
                            fontSize: { xs: "24px", md: "32px" },
                          }}
                        />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Tooltip>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default CarouselWithSwiper; 