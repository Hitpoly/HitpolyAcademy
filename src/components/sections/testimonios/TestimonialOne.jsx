// src/sections/testimonios/TestimonialOne.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

const TestimoniosSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReviewText, setSelectedReviewText] = useState("");
  const [selectedReviewName, setSelectedReviewName] = useState("");

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        const commentsResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerComentariosDestacadosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getAll" }),
          }
        );
        const commentsData = await commentsResponse.json();

        if (!commentsResponse.ok || commentsData.status !== "success") {
          throw new Error(commentsData.message || "Error al cargar comentarios.");
        }

        const allUsersResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getAllUserController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getAllUser" }),
          }
        );
        const allUsersData = await allUsersResponse.json();

        let mappedUsers = {};
        if (allUsersData.status === "success" && Array.isArray(allUsersData.clases)) {
          mappedUsers = allUsersData.clases.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
        }

        const uniqueClassIds = [...new Set(commentsData.comentarios.map(c => c.clase_id).filter(id => id))];
        const fetchedCourseNames = {};

        await Promise.all(
          uniqueClassIds.map(async (classId) => {
            try {
              const res = await fetch("https://apiacademy.hitpoly.com/ajax/traerNombreCursoPorIdClaseController.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "getCursosPorIdClase", id: classId }),
              });
              const data = await res.json();
              fetchedCourseNames[classId] = data.status === "success" ? data.cursos.titulo : "Programa Hitpoly";
            } catch {
              fetchedCourseNames[classId] = "Programa Hitpoly";
            }
          })
        );

        const finalReviews = commentsData.comentarios.map((comment) => {
          const user = mappedUsers[comment.usuario_id];
          const programName = fetchedCourseNames[comment.clase_id] || "Programa Hitpoly";
          
          return {
            id: comment.id,
            text: comment.contenido || "Excelente curso, muy recomendado.",
            name: user ? `${user.nombre} ${user.apellido || ""}`.trim() : "Estudiante de Hitpoly",
            program: programName,
            image: user?.avatar || null, // Aquí extraemos la imagen
          };
        });

        setReviews(finalReviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleOpenDialog = (text, name) => {
    setSelectedReviewText(text);
    setSelectedReviewName(name);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando experiencias...</Typography>
      </Box>
    );
  }

  if (error || reviews.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 8, backgroundColor: "#fff", px: { xs: 2, md: 4 }, overflow: "hidden" }}>
      <Box sx={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 'bold' }}>
          Testimonios
        </Typography>
        <Typography variant="h3" pb={4} pt={3}>
          Opiniones reales de nuestra comunidad
        </Typography>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          style={{ 
            paddingTop: '30px',    
            paddingBottom: '60px', 
            overflow: 'visible'    
          }}
        >
          {reviews.map((review) => {

            return (
              <SwiperSlide key={review.id} style={{ overflow: 'visible' }}>
                <Box
                  sx={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 4,
                    p: 4,
                    height: "100%",
                    minHeight: "280px",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    cursor: 'pointer',
                    border: "1px solid #eee",
                    "&:hover": { 
                      transform: "translateY(-15px)", 
                      boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
                      borderColor: "primary.main",
                      backgroundColor: "#fff"
                    },
                  }}
                  onClick={() => handleOpenDialog(review.text, review.name)}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      fontStyle: "italic",
                      color: "#374151",
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.6
                    }}
                  >
                    "{review.text}"
                  </Typography>
                  
                  <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={review.image}
                      alt={review.name}
                      sx={{ 
                        width: 55, 
                        height: 55, 
                        bgcolor: "secondary.main",
                        border: "2px solid #fff",
                        boxShadow: 1
                      }}
                    >
                      {review.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {review.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {review.program}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Testimonio de {selectedReviewName}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ color: "text.primary", whiteSpace: "pre-line" }}>
            {selectedReviewText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" sx={{ borderRadius: 2 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestimoniosSection;