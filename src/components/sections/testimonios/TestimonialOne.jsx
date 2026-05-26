import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Estilos obligatorios de Swiper
import "swiper/css";
import "swiper/css/pagination";

// Importación de sub-componentes (Asegúrate de tener estos archivos creados)
import TestimonialCard from "./TestimonialCard";
import TestimonialDialog from "./TestimonialDialog";

const TestimoniosSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState({ open: false, text: "", name: "" });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        // 1. Obtener Comentarios
        const commentsRes = await fetch("https://apiacademy.hitpoly.com/ajax/traerComentariosDestacadosController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getAll" }),
        });
        const commentsData = await commentsRes.json();
        if (commentsData.status !== "success") throw new Error("Error al cargar comentarios.");

        // 2. Obtener Usuarios
        const usersRes = await fetch("https://apiacademy.hitpoly.com/ajax/getAllUserController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getAllUser" }),
        });
        const usersData = await usersRes.json();
        const mappedUsers = (usersData.clases || []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

        // 3. Obtener Nombres de Cursos
        const uniqueIds = [...new Set(commentsData.comentarios.map(c => c.clase_id))];
        const courseNames = {};
        
        await Promise.all(uniqueIds.map(async (id) => {
          try {
            const res = await fetch("https://apiacademy.hitpoly.com/ajax/traerNombreCursoPorIdClaseController.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getCursosPorIdClase", id }),
            });
            const d = await res.json();
            courseNames[id] = d.status === "success" ? d.cursos.titulo : "Programa Hitpoly";
          } catch {
            courseNames[id] = "Programa Hitpoly";
          }
        }));

        const finalReviews = commentsData.comentarios.map(comment => ({
          id: comment.id,
          text: comment.contenido || "Excelente curso.",
          name: mappedUsers[comment.usuario_id] 
            ? `${mappedUsers[comment.usuario_id].nombre} ${mappedUsers[comment.usuario_id].apellido || ""}`.trim() 
            : "Estudiante de Hitpoly",
          program: courseNames[comment.clase_id] || "Programa Hitpoly",
          image: mappedUsers[comment.usuario_id]?.avatar || null,
        }));

        setReviews(finalReviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleOpenDialog = (text, name) => setDialog({ open: true, text, name });
  const handleCloseDialog = () => setDialog({ ...dialog, open: false });

  if (loading) return (
    <Box sx={{ p: 10, textAlign: "center" }}>
      <CircularProgress /><Typography sx={{ mt: 2 }}>Cargando experiencias...</Typography>
    </Box>
  );

  if (error || reviews.length === 0) return null;

  return (
    <Box 
      component="section"
      sx={{ 
        backgroundColor: "#fff", 
        // Padding lateral responsivo (el que Swiper debe respetar)
        px: { xs: 2, sm: 4, md: 10 }, 
        py: { xs: 4, md: 6 }, 
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden" // Evita el scroll horizontal en toda la página
      }}
    >
      <Box sx={{ 
        width: "100%", 
        maxWidth: "1400px", 
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        minWidth: 0 // <--- ESTO ES VITAL: impide que Swiper empuje los bordes
      }}>
        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: "bold" }}>
          Testimonios
        </Typography>
        <Typography variant="h3" pb={4} pt={3} sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
          Opiniones reales de nuestra comunidad
        </Typography>

        {/* Contenedor relativo para el Swiper */}
        <Box sx={{ width: "100%", minWidth: 0 }}>
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{ 
              640: { slidesPerView: 2 }, 
              1024: { slidesPerView: 3 } 
            }}
            style={{ 
              paddingTop: "20px", 
              paddingBottom: "60px",
              paddingLeft: "10px", // Espacio extra para sombras de tarjetas
              paddingRight: "10px",
              width: "100%",
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id} style={{ height: "auto", display: "flex" }}>
                <TestimonialCard review={review} onClick={handleOpenDialog} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>

      <TestimonialDialog 
        open={dialog.open} 
        onClose={handleCloseDialog} 
        name={dialog.name} 
        text={dialog.text} 
      />
    </Box>
  );
};

export default TestimoniosSection;