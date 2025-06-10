import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const benefits = [
  "Obtenga credenciales valiosas de las mejores universidades y empresas.",
  "Acceda a recursos de apoyo y planificación profesional.",
  "Aprenda de profesores universitarios de primer nivel y de líderes de la industria.",
  "Mejora tus habilidades a tu ritmo con opciones flexibles híbridas o 100 % en línea.",
  "Únase a una red global de profesionales en su industria.",
];

const CommunitySection = () => {
  return (
    <Box
      sx={{
        padding: { xs: "50px 20px", md: "140px 150px" },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "50%" }, mb: { xs: 4, md: 0 } }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Únase a una comunidad, no solo a un aula
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#555", mb: 3 }}>
          Con HitpolyAcademy, puedes esperar los tipos de beneficios que te
          preparan para el crecimiento profesional y personal a largo plazo.
        </Typography>
        <List>
          {benefits.map((benefit, idx) => (
            <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={benefit} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ width: { xs: "100%", md: "50%" } }}>
        <Box
          component="img"
          src="/images/setters.jpg"
          alt="Estudiantes conectados"
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
      </Box>
    </Box>
  );
};

export default CommunitySection;
