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
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

const TestimoniosSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersById, setUsersById] = useState({}); 
  const [courseNamesById, setCourseNamesById] = useState({}); 

  const swiperRef = useRef(null);

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
      <Box sx={{ py: 5, backgroundColor: "#fff", textAlign: "left" }}>
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
    <Box sx={{ py: 5, backgroundColor: "#fff", textAlign: "left" }}>
      <Typography
        variant="overline"
        sx={{ color: "#666", textTransform: "uppercase" }}
      >
        Lo que dicen los estudiantes
      </Typography>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Opiniones reales sobre nuestros programas
      </Typography>

      <Box
        sx={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: { xs: "center", sm: "flex-start" },
          gap: 3,
        }}
      >
        {reviews.map((review, idx) => (
          <Box
            key={review.id || idx}
            sx={{
              backgroundColor: "#f4f4f4",
              borderRadius: 2,
              boxShadow: 1,
              p: 3,
              height: "auto",
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: { xs: "100%", sm: "calc(50% - 15px)", md: "calc(33.33% - 20px)" },
              maxWidth: "300px",
              textAlign: "left",
            }}
          >
            <Typography
              variant="body1"
              sx={{ mb: 2, fontStyle: "italic", color: "#444" }}
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
        ))}
      </Box>
    </Box>
  );
};

export default TestimoniosSection;