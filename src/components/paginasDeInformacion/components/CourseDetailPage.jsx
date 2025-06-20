import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import VideoPlayerWithControls from "../../videos/VideoPlayerWithControls";
import CountdownBanner from "../../cronometro/CountdownBanner";

const CourseDetailPage = ({ course, countdownTargetDate }) => {
  const [visibleModules, setVisibleModules] = useState(2);
  const totalModules = course.modules?.length || 0;

  const handleToggleModules = () => {
    setVisibleModules(visibleModules === 2 ? totalModules : 2);
  };

  if (!course) {
    return (
      <Typography variant="h6">Cargando información del curso...</Typography>
    );
  }

  const courseInfoChips = [
    { icon: <PersonIcon />, label: `Instructor: ${course.instructor}` },
    { icon: <AccessTimeIcon />, label: `Duración: ${course.duration}` },
    {
      icon: <OndemandVideoIcon />,
      label: `Nivel: ${course.level}`,
      color: "primary",
    },
  ];

  // Añade el chip de precio si está disponible
  if (course.price) {
    courseInfoChips.push({
      icon: <MonetizationOnIcon />,
      label: `Precio: ${course.price}`,
      color: "success",
    });
  }

  return (
    <Container sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            height: "100%", // Asegura que el contenedor flex tome la altura completa si es necesario
          }}
        >
          {/* Columna izquierda: Video, Chips de información y Resultados de aprendizaje */}
          <Box sx={{ flex: 1 }}> {/* flex: 1 permite que ocupe el espacio disponible */}
            {/* Contenedor del reproductor de video */}
            <Box sx={{ paddingBottom: { xs: "20px", md: "30px 0px" } }}>
              <VideoPlayerWithControls videoUrl={course.inductionVideoUrl} />
            </Box>

            {/* Chips de información del curso */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 5,
                mt: { xs: 4, md: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: { xs: 1, md: 7 },
                }}
              >
                {courseInfoChips.map((chip, index) => (
                  <Box key={index}>
                    <Chip
                      icon={chip.icon}
                      label={chip.label}
                      color={chip.color || "default"}
                      size="small"
                      sx={{
                        padding: "20px",
                        width: '100%', // Asegura que el chip ocupe el 100% del Box que lo envuelve
                        justifyContent: 'center',
                        '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Sección "¿Qué aprenderás en este curso?" y CountdownBanner */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column", // Se mantiene como columna para centrar el texto
                alignItems: "center", // Centra el contenido horizontalmente
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ¿Qué aprenderás en este curso?
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" }, // Aquí se define el layout de dos columnas
                  width: "100%", // Asegura que este contenedor ocupe todo el ancho disponible para sus columnas internas
                  gap: 4, // Espacio entre las dos columnas
                }}
              >
                {/* Columna para los resultados de aprendizaje (60% en MD, 100% en XS) */}
                <Box sx={{ width: { xs: "100%", md: "60%" } }}>
                  <List>
                    {course.learningOutcomes?.map((outcome, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={outcome}
                          sx={{ wordWrap: "break-word" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Columna para el CountdownBanner (40% en MD, 100% en XS) */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "40%" }, // Este Box define el 40% del ancho para el banner en MD
                    // backgroundColor: "red", // Puedes quitarlo, era para depurar
                    display: "flex", // Asegura que el contenido interno (el Box negro) respete el ancho
                    justifyContent: "center", // Opcional: Centra el banner si es más pequeño que el 40%
                    alignItems: "flex-start", // Alinea el banner al inicio verticalmente si hay espacio extra
                  }}
                >
                  <Box
                    sx={{
                      width: "100%", // Este Box interno se asegura de ocupar el 100% del Box padre (el del 40%)
                      // backgroundColor: "black", // Puedes quitarlo, era para depurar
                      display: "flex", // Añadido para asegurar que CountdownBanner ocupe el 100% del Box
                    }}
                  >
                    <CountdownBanner
                      title="¡Gran Venta de Verano!"
                      subtitle="No te pierdas descuentos exclusivos. ¡El tiempo se acaba!"
                      targetDate={countdownTargetDate}
                      ctaText="Explorar Ofertas Ahora"
                      ctaLink="https://www.ejemplo.com/ofertas"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Sección de Contenido del Curso (Módulos) */}
        <Typography variant="h6" gutterBottom>
          Contenido del Curso
        </Typography>
        <Box>
          {course.modules?.slice(0, visibleModules).map((module, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{ mb: 2, p: 2, borderRadius: 1 }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Módulo {index + 1}: {module.title}
              </Typography>
              <List dense>
                {module.topics?.map((topic, topicIndex) => (
                  <ListItem key={topicIndex} disablePadding>
                    <ListItemIcon>
                      <PlayCircleOutlineIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={topic}
                      sx={{ wordWrap: "break-word" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ))}

          {totalModules > 2 && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
              <Button
                onClick={handleToggleModules}
                variant="text"
                color="primary"
                sx={{
                  textTransform: "none",
                  fontWeight: "normal",
                  p: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                {visibleModules === 2 ? "Ver más" : "Ocultar"}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CourseDetailPage;