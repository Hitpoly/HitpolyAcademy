import React from "react";
import { Box } from "@mui/material";
import CursoCard from "../../../components/cards/CursoCard";

const CourseCarousel = ({ courses }) => {
  return (
    <Box
      sx={{
        display: "flex",
        overflowX: "auto",
        // Igualamos el gap: más ancho en móvil (xs: 5 = 40px) y estándar en desktop (sm: 3 = 24px)
        gap: { xs: 5, sm: 3 }, 
        py: 3, 
        // El scroll padding asegura que el "snap" respete el margen inicial
        scrollPaddingLeft: "24px", 
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#ccc", borderRadius: "10px" },
        width: "100%",
      }}
    >
      {courses.map((course, index) => (
        <Box
          key={course.id}
          sx={{
            flex: "0 0 auto",
            // IGUALADO A SECTION TWO: Usamos píxeles fijos para mantener la consistencia
            width: { xs: "280px", sm: "300px", md: "320px" },
            scrollSnapAlign: "start",
            // Márgenes de seguridad para el inicio y el final del carrusel
            ml: index === 0 ? "24px" : 0, 
            mr: index === courses.length - 1 ? "24px" : 0,
          }}
        >
          <CursoCard {...course} />
        </Box>
      ))}
    </Box>
  );
};

export default CourseCarousel;