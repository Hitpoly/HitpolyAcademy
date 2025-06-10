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
import CourseVideo from "../components/CourseVideo";
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
            height: "100%",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {course.description}
            </Typography>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ padding: { xs: "20px", md: "30px 0px" } }}>
              <CourseVideo videoUrl={course.inductionVideoUrl} />
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
                        width: '100%', // Ancho fijo para los chips
                        justifyContent: 'center', // Centra el contenido (icono y texto) dentro del chip
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ width: { xs: "100%", md: "70%" } }}>
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
                <Box sx={{ width: { xs: "100%", md: "40%" } }}>
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

        <Divider sx={{ my: 3 }} />

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