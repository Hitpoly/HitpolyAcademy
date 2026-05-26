import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import SmallCourseCard from "../../cards/SmallCourseCard";

import "swiper/css";
import "swiper/css/pagination";

const RelatedCoursesCarousel = ({ currentCourseId, categoriaId, profesorId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://apiacademy.hitpoly.com/ajax/traerCursosController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursos" }),
        });
        const data = await res.json();
        
        if (data.status === "success" || data.cursos) {
          const allCursos = data.cursos || [];
          
          // Filtrar por misma categoría Y mismo profesor
          // Excluir el curso actual
          const filtered = allCursos.filter(c => 
            String(c.id) !== String(currentCourseId) &&
            String(c.categoria_id) === String(categoriaId) &&
            String(c.profesor_id) === String(profesorId) &&
            c.estado === "Publicado"
          ).map(c => ({
            id: c.id,
            title: c.titulo,
            portada_targeta: c.portada_targeta,
            price: `${c.precio} ${c.moneda}`
          }));

          setCourses(filtered);
        }
      } catch (e) {
        console.error("[RELATED] Error fetching related courses:", e);
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId && profesorId) {
      fetchRelated();
    }
  }, [currentCourseId, categoriaId, profesorId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={24} sx={{ color: "#F21C63" }} />
      </Box>
    );
  }

  if (courses.length === 0) return null;

  return (
    <Box sx={{ 
      mt: 3, 
      width: "100%",
      "& .swiper-pagination-bullet": {
        bgcolor: "rgba(255, 255, 255, 0.5)",
        opacity: 1,
      },
      "& .swiper-pagination-bullet-active": {
        bgcolor: "#fff",
      }
    }}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: "#fff", opacity: 0.9, mb: 1.5 }}>
        Cursos relacionados del mismo profesor:
      </Typography>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={8}
        slidesPerView={2}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          320: { slidesPerView: 1 },
          480: { slidesPerView: 2 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2 },
        }}
        style={{ paddingBottom: "30px", width: "100%" }}
        pagination={{ clickable: true }}
      >
        {courses.map((course) => (
          <SwiperSlide key={course.id}>
            <SmallCourseCard course={course} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default RelatedCoursesCarousel;
