import React from "react";
import { Box, Typography, Divider, Avatar } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

const reviews = [
  {
    text: "Este curso me ayudó a reflexionar sobre la persona que quiero ser. El espacio mental que me brindó me permitió ampliar mis horizontes y pensar en oportunidades que antes no había considerado.",
    name: "Maggie B.",
    // Programa actualizado para referirse a HitPoly Academy
    program: "Programa de Certificación Profesional en Lean Six Sigma - HitPoly Academy",
  },
  {
    text: "Un empleador estaba muy interesado en mi experiencia en el campamento de entrenamiento y no podía creer todo lo que aprendí en tan solo seis meses. Al final conseguí el trabajo.",
    name: "Danielle D.",
    // Programa actualizado para referirse a HitPoly Academy
    program: "Bootcamp de Marketing Digital - HitPoly Academy",
  },
  {
    text: "El programa en línea me ayudó a reorientar mis principales tareas como líder: interactuar con mi equipo y conectar con posibles partes interesadas.",
    name: "Delgado C.",
    // Programa actualizado para referirse a HitPoly Academy
    program: "Programa de Liderazgo Ejecutivo - HitPoly Academy",
  },
];

const TestimoniosSection = () => {
  return (
    <Box sx={{ backgroundColor: "#fffff" }}>
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