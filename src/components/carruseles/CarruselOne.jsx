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
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const CarouselWithSwiper = ({ alumnos }) => {
  const swiperRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isHovered, setIsHovered] = useState({});
  const [tooltipOpen, setTooltipOpen] = useState({});

  const handleMouseEnter = (idx) => {
    setIsHovered((prev) => ({ ...prev, [idx]: true }));
    setTooltipOpen((prev) => ({ ...prev, [idx]: true }));
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
          padding: {xs: "20px 0 20px 0", md: "20px 0 0px 0"},
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
              key={idx}
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