// src/sections/testimonios/TestimonialOne.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// No importamos "swiper/css/navigation" si no vamos a usar las flechas
// import "swiper/css/navigation"; 

// import required modules
import { Pagination, Autoplay } from "swiper/modules"; // Eliminamos Navigation de aquí

const TestimoniosSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersById, setUsersById] = useState({});
  const [courseNamesById, setCourseNamesById] = useState({});
  // Estados para el diálogo de texto completo
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

        if (
          !commentsResponse.ok ||
          commentsData.status !== "success" ||
          !Array.isArray(commentsData.comentarios)
        ) {
          throw new Error(
            commentsData.message ||
              "La API de comentarios destacados no devolvió una lista válida."
          );
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
        setUsersById(mappedUsers);

        const uniqueClassIds = [
          ...new Set(
            commentsData.comentarios
              .map((comment) => comment.clase_id)
              .filter(id => id != null)
          ),
        ];

        const fetchedCourseNames = {};
        if (uniqueClassIds.length > 0) {
          await Promise.all(
            uniqueClassIds.map(async (classId) => {
              try {
                const courseNameResponse = await fetch(
                  "https://apiacademy.hitpoly.com/ajax/traerNombreCursoPorIdClaseController.php",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion: "getCursosPorIdClase", id: classId }),
                  }
                );
                const courseNameData = await courseNameResponse.json();

                if (courseNameResponse.ok && courseNameData.status === "success" && courseNameData.cursos && courseNameData.cursos.titulo) {
                  fetchedCourseNames[classId] = courseNameData.cursos.titulo;
                } else {
                  fetchedCourseNames[classId] = "Curso no especificado";
                }
              } catch (courseError) {
                fetchedCourseNames[classId] = "Error al cargar curso";
              }
            })
          );
        }
        setCourseNamesById(fetchedCourseNames);


        const fetchedReviews = commentsData.comentarios.map((comment) => {
          const user = mappedUsers[comment.usuario_id];
          let fullName = "Usuario Desconocido";
          if (user) {
            if (user.nombre && user.apellido) {
              fullName = `${user.nombre} ${user.apellido}`;
            } else if (user.nombre) {
              fullName = user.nombre;
            } else if (user.apellido) {
              fullName = user.apellido;
            }
          }

          const programName = fetchedCourseNames[comment.clase_id] || "Programa no especificado";

          return {
            id: comment.id,
            text: comment.contenido || "Sin comentario",
            name: fullName,
            program: programName,
            image: user?.url_foto_perfil || null,
          };
        });
        setReviews(fetchedReviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Función para abrir el diálogo con el texto completo
  const handleOpenDialog = (text, name) => {
    setSelectedReviewText(text);
    setSelectedReviewName(name);
    setOpenDialog(true);
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReviewText("");
    setSelectedReviewName("");
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "left" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, display: 'inline-block' }}>Cargando testimonios destacados...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "left" }}>
        <Alert severity="error">Error al cargar testimonios destacados: {error}</Alert>
      </Box>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Box sx={{ py: 5, backgroundColor: "#fff", textAlign: "left", px: { xs: 2, md: 0 } }}>
        <Typography
          variant="overline"
          sx={{ color: "#666", textTransform: "uppercase" }}
        >
          Lo que dicen los estudiantes
        </Typography>
        <Typography variant="h3" sx={{ mb: 4 }}>
          Opiniones reales sobre nuestros programas
        </Typography>
        <Typography variant="h6" color="text.secondary">
          No hay testimonios destacados disponibles en este momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 5, backgroundColor: "#fff", textAlign: "left", px: { xs: 2, md: 0 } }}>
      <Typography
        variant="overline"
        sx={{ color: "#666", textTransform: "uppercase" }}
      >
        Lo que dicen los estudiantes
      </Typography>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Opiniones reales sobre nuestros programas
      </Typography>

      <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Swiper
          modules={[Pagination, Autoplay]} // Eliminado Navigation de los módulos
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          // Eliminada la propiedad navigation={true}
          breakpoints={{
            600: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            900: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          style={{ paddingBottom: '40px' }}
        >
          {reviews.map((review, idx) => (
            <SwiperSlide key={review.id || idx}>
              <Box
                sx={{
                  backgroundColor: "#f4f4f4",
                  borderRadius: 2,
                  boxShadow: 1,
                  p: 3,
                  height: "auto",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textAlign: "left",
                  width: '100%',
                  mb: 2,
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenDialog(review.text, review.name)}
              >
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    fontStyle: "italic",
                    color: "#444",
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  "{review.text}"
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={review.image || undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {!review.image && <SchoolIcon />}
                    {!review.image &&
                      review.name &&
                      review.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.name}
                    </Typography>
                    <Tooltip title={review.program} enterDelay={500}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {review.program}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Diálogo para mostrar el texto completo */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="review-dialog-title"
        aria-describedby="review-dialog-description"
      >
        <DialogTitle id="review-dialog-title">Testimonio de {selectedReviewName}</DialogTitle>
        <DialogContent>
          <DialogContentText id="review-dialog-description">
            {selectedReviewText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestimoniosSection;