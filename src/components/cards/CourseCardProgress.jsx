// src/components/CourseCard.jsx
import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const CourseCard = ({ curso }) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column", // ¡Aquí está la clave! Apila los elementos verticalmente
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        borderRadius: 2,
        overflow: "hidden",
        width: "100%",
        "&:hover": {
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* La imagen va primero en el orden del JSX */}
      <CardMedia
        component="img"
        sx={{
          width: "100%", // La imagen ocupará todo el ancho de la tarjeta
          height: { xs: 150, sm: 200 }, // Altura fija para la imagen en diferentes tamaños de pantalla
          objectFit: "cover", // Asegura que la imagen cubra el espacio sin distorsionarse
        }}
        image={curso.thumbnail || "/images/default-course-thumbnail.jpg"}
        alt={curso.titulo}
      />
      
      {/* Luego va el Box que contiene el título, descripción, progreso y botón */}
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <CardContent sx={{ flex: "1 0 auto", p: 2 }}>
          <Typography component="div" variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {curso.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {curso.descripcion}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={curso.progreso}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#6C4DE2",
              },
              mb: 1,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
            **{curso.progreso}%** completado
          </Typography>
        </CardContent>
        <Box sx={{ display: "flex", alignItems: "center", p: 1.5, pl: 2, bgcolor: "#f9f9f9" }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              bgcolor: "#6C4DE2",
              "&:hover": { bgcolor: "#5A3BBF" },
              borderRadius: 2,
              px: 2,
              py: 0.8,
              textTransform: 'none'
            }}
            onClick={() => console.log(`Continuar curso: ${curso.titulo}`)}
          >
            Continuar
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default CourseCard;