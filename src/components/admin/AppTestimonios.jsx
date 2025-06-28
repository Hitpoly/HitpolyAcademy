import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import TestimoniosSection from "../sections/testimonios/TestimonialOne"; // Asegúrate de que esta ruta sea correcta

const AppTestimonios = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({}); // Para almacenar los usuarios por ID

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Obtener todos los comentarios
        const commentsResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getComentariosController.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accion: "getComentarios" }),
          }
        );

        if (!commentsResponse.ok) {
          throw new Error(
            `Error al cargar comentarios: ${commentsResponse.statusText}`
          );
        }

        const commentsData = await commentsResponse.json();
        console.log("📥 Comentarios recibidos:", commentsData);

        if (
          commentsData.status !== "success" ||
          !Array.isArray(commentsData.comentarios)
        ) {
          throw new Error("La API no devolvió una lista válida de comentarios.");
        }

        const comentarios = commentsData.comentarios;

        // 2. Obtener los datos de los usuarios para cada comentario
        const userPromises = comentarios.map(async (comment) => {
          if (comment.id_usuario) {
            const userResponse = await fetch(
              "https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accion: "getAlumnoProfesor",
                  id: comment.id_usuario,
                }),
              }
            );

            if (!userResponse.ok) {
              console.warn(
                `⚠️ No se pudo cargar el usuario con ID ${comment.id_usuario}: ${userResponse.statusText}`
              );
              return null;
            }

            const userData = await userResponse.json();
            return { id: comment.id_usuario, data: userData };
          }

          return null;
        });

        const usersDataArray = (await Promise.all(userPromises)).filter(Boolean);
        const usersById = usersDataArray.reduce((acc, user) => {
          acc[user.id] = user.data;
          return acc;
        }, {});

        setUsers(usersById);

        // 3. Formatear los comentarios para TestimoniosSection
        const formattedReviews = comentarios.map((comment) => ({
          text: comment.comentario,
          name: usersById[comment.id_usuario]?.nombre || "Usuario Desconocido",
          program: comment.programa || "Programa no especificado",
        }));

        setReviews(formattedReviews);
      } catch (err) {
        console.error("❌ Error cargando testimonios:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando comentarios...</Typography>
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
          height: "200px",
        }}
      >
        <Alert severity="error">
          Error al cargar los comentarios: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <TestimoniosSection reviews={reviews} />
    </Box>
  );
};

export default AppTestimonios;
