import React, { useState } from "react";
import { Container, Typography, Box, Paper, Button, List, ListItem, ListItemText, ListItemIcon, Divider, Chip } from "@mui/material";
import { CheckCircleOutline as CheckIcon, LibraryBooks as ModuleIcon, Class as ClassIcon, AccessTime, Person, MonetizationOn, OndemandVideo } from "@mui/icons-material";
import VideoPlayerWithControls from "../../videos/VideoPlayerWithControls";
import CountdownBanner from "../../cronometro/CountdownBanner";

const CourseDetailPage = ({ course, countdownTargetDate }) => {
  const [showAllOutcomes, setShowAllOutcomes] = useState(false);
  const [showAllModules, setShowAllModules] = useState(false);

  if (!course) return <Typography variant="h6">Cargando...</Typography>;

  // Configuración de chips
  const chips = [
    { icon: <Person />, label: `Instructor: ${course.instructor}` },
    { icon: <AccessTime />, label: `Duración: ${course.duration}` },
    { icon: <OndemandVideo />, label: `Nivel: ${course.level}`, color: "primary" },
    ...(course.price ? [{ icon: <MonetizationOn />, label: `Precio: ${course.price}`, color: "success" }] : [])
  ];

  // Helper para botones "Ver más"
  const ExpandButton = ({ toggle, isOpen, labelOn, labelOff }) => (
    <Button onClick={() => toggle(!isOpen)} variant="text" sx={{ textTransform: "none", p: 0, "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}>
      {isOpen ? labelOff : labelOn}
    </Button>
  );

  return (
    <Container sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        {/* Video y Chips */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ pb: { xs: 2, md: 4 }, mx: { xs: -2, md: -4 }, mt: { xs: -2, md: -4 } }}>
            <VideoPlayerWithControls videoUrl={course.inductionVideoUrl} />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: { xs: 1, md: 7 }, mb: 5 }}>
            {chips.map((c, i) => (
              <Chip key={i} {...c} size="small" sx={{ p: 2.5, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }} />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Learning Outcomes y Countdown */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, mb: 5 }}>
          <Box sx={{ width: { xs: "100%", md: "60%" } }}>
            <Typography variant="h6" gutterBottom>¿Qué aprenderás en este curso?</Typography>
            <List>
              {(showAllOutcomes ? course.learningOutcomes : course.learningOutcomes?.slice(0, 3))?.map((item, i) => (
                <Paper key={i} elevation={2} sx={{ mb: 2, p: 2 }}>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                </Paper>
              ))}
            </List>
            {course.learningOutcomes?.length > 3 && (
              <ExpandButton toggle={setShowAllOutcomes} isOpen={showAllOutcomes} labelOn="Ver más temas" labelOff="Ocultar temas" />
            )}
          </Box>

          <Box sx={{ width: { xs: "100%", md: "40%" } }}>
            <CountdownBanner title="¡Gran Venta de Verano!" subtitle="¡El tiempo se acaba!" targetDate={countdownTargetDate} ctaText="Explorar Ofertas" ctaLink="#" />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Módulos */}
        {course.modules?.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Contenido del Curso</Typography>
            {(showAllModules ? course.modules : course.modules.slice(0, 2)).map((mod, i) => (
              <Paper key={i} elevation={2} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <ModuleIcon color="action" sx={{ mr: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold">Módulo {i + 1}: {mod.title}</Typography>
                </Box>
                <List dense sx={{ pl: 4 }}>
                  {mod.topics?.map((topic, ti) => (
                    <ListItem key={ti} disablePadding>
                      <ListItemIcon sx={{ minWidth: 35 }}><ClassIcon color="secondary" fontSize="small" /></ListItemIcon>
                      <ListItemText primary={topic} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
            {course.modules.length > 2 && (
              <ExpandButton toggle={setShowAllModules} isOpen={showAllModules} labelOn="Ver más módulos" labelOff="Ocultar módulos" />
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CourseDetailPage;