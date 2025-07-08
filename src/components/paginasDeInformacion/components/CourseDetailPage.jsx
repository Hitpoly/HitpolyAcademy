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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Ícono para el temario (lo que aprenderás)
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks"; // Nuevo ícono para Módulos
import ClassIcon from "@mui/icons-material/Class"; // Nuevo ícono para Clases (dentro de módulos)
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import VideoPlayerWithControls from "../../videos/VideoPlayerWithControls";
import CountdownBanner from "../../cronometro/CountdownBanner";

const CourseDetailPage = ({ course, countdownTargetDate }) => {
  const [visibleLearningOutcomes, setVisibleLearningOutcomes] = useState(3); 
   const [visibleModules, setVisibleModules] = useState(2); 

  const totalLearningOutcomes = course.learningOutcomes?.length || 0;
  const totalCourseModules = course.modules?.length || 0;

  const handleToggleLearningOutcomes = () => {
    setVisibleLearningOutcomes(
      visibleLearningOutcomes === 3 ? totalLearningOutcomes : 3
    );
  };

  const handleToggleModules = () => {
    setVisibleModules(visibleModules === 2 ? totalCourseModules : 2);
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

  if (course.price) {
    courseInfoChips.push({
      icon: <MonetizationOnIcon />,
      label: `Precio: ${course.price}`,
      color: "success",
    });
  }

  return (
    <Container sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: {xs: 2, md: 4}, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            height: "100%",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ paddingBottom: { xs: "20px", md: "30px 0px" } }}>
              <VideoPlayerWithControls videoUrl={course.inductionVideoUrl} />
            </Box>
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
                        width: "100%",
                        justifyContent: "center",
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

       <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            gap: 4,
            mb: 5,
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "60%" } }}>
            <Typography variant="h6" gutterBottom>
              ¿Qué aprenderás en este curso?
            </Typography>
            {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
              <>
                <List>
                  {course.learningOutcomes
                    ?.slice(0, visibleLearningOutcomes)
                    .map((item, index) => (
                      <Paper key={index} elevation={2} sx={{ mb: 2, p: 2, borderRadius: 1 }}>
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" />{" "}
                          </ListItemIcon>
                          <ListItemText
                            primary={item}
                            sx={{ wordWrap: "break-word" }}
                          />
                        </ListItem>
                      </Paper>
                    ))}
                </List>
                {totalLearningOutcomes > 3 && ( 
                  <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
                    <Button
                      onClick={handleToggleLearningOutcomes}
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
                      {visibleLearningOutcomes === 3
                        ? "Ver más temas"
                        : "Ocultar temas"}
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay temas de aprendizaje definidos para este curso.
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "40%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
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

        <Divider sx={{ my: 3 }} />
        {course.modules && course.modules.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Contenido del Curso (Módulos)
            </Typography>
            {course.modules.slice(0, visibleModules).map((module, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{ mb: 2, p: 2, borderRadius: 1 }}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon>
                    <LibraryBooksIcon color="action" /> 
                  </ListItemIcon>
                  <Typography variant="subtitle1" component="span" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Módulo {index + 1}: {module.title}
                  </Typography>
                </ListItem>
                <List dense sx={{ pl: 2 }}>
                  {module.topics?.map((topic, topicIndex) => (
                    <ListItem key={topicIndex} disablePadding>
                      <ListItemIcon>
                        <ClassIcon color="secondary" /> 
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

            {totalCourseModules > 2 && ( 
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
                  {visibleModules === 2 ? "Ver más módulos" : "Ocultar módulos"}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CourseDetailPage;