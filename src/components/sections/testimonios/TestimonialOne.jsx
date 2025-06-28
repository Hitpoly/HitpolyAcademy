import React from "react";
import { Box, Typography, Divider, Avatar } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

const TestimoniosSection = ({ reviews }) => {
  // Añade una verificación aquí: si reviews no es un array o está vacío, muestra un mensaje o no renderices nada
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No hay comentarios disponibles en este momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#ffffff" }}>
      <Typography variant="overline" sx={{ color: "#666", textTransform: "uppercase" }}>
        Lo que dicen los estudiantes
      </Typography>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Opiniones reales sobre nuestros programas
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        {reviews.map((review, idx) => (
          <Box
            key={idx}
            sx={{
              backgroundColor: "#f4f4f4",
              borderRadius: 2,
              boxShadow: 1,
              p: 3,
              flex: 1,
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              {review.text}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar>
                <SchoolIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {review.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {review.program}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TestimoniosSection;