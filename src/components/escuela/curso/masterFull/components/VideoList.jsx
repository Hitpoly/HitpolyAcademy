import React, { useState, useEffect } from "react"; // Asegúrate de importar useEffect
import { Box, List, ListItem, ListItemText, Typography, Collapse, IconButton } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const VideoList = ({ // Renombrado a VideoList para consistencia
  modules = [],
  onSelectVideo,
  completedVideos,
  toggleCompletedVideo,
  selectedVideoId,
  // Ya no necesitamos expandedModuleId ni setExpandedModuleId directamente aquí
  // si el control del 'primer módulo abierto' se maneja internamente.
  // Pero si quieres que VideoLayout siga teniendo la capacidad de forzar un módulo abierto,
  // podríamos mantenerlos. Para esta solicitud específica, lo haremos internamente.
}) => {
  const [openModules, setOpenModules] = useState({});

  // Efecto para inicializar el primer módulo como abierto
  useEffect(() => {
    if (modules.length > 0) {
      const firstModuleId = modules[0].id;
      setOpenModules(prev => ({
        ...prev,
        [firstModuleId]: true // Establece el primer módulo como abierto
      }));
    }
  }, [modules]); // Se ejecuta cuando los módulos cambian (es decir, cuando se cargan)

  const handleModuleClick = (moduleId) => {
    setOpenModules(prev => ({
      ...prev,
      // Esto permite alternar, pero el primer módulo se reabrirá en la carga inicial
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleChangeVideo = (clase) => {
    onSelectVideo(clase);
  };

  const handleToggleCompleted = (claseId, event) => {
    event.stopPropagation();
    toggleCompletedVideo(claseId);
  };

  return (
    <Box
      sx={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#fafafa",
        maxHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: '8px',
        boxShadow: '0px 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: "20px", color: "#00695C", fontWeight: 'bold' }}>
        Contenido del Curso
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List component="nav">
          {modules.map((module) => (
            <React.Fragment key={module.id}>
              {/* Encabezado del Módulo */}
              <ListItem
                sx={{
                  backgroundColor: "#e0f2f7",
                  marginBottom: "5px",
                  borderRadius: "4px",
                  fontWeight: 'bold',
                  color: "#006064",
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  primary={`Módulo ${module.order || 'N/A'}: ${module.title}`}
                  // Puedes hacer que el texto del módulo también sea cliqueable si lo deseas:
                  // onClick={() => handleModuleClick(module.id)}
                  // sx={{ cursor: 'pointer' }}
                />
                <IconButton
                  onClick={() => handleModuleClick(module.id)}
                  aria-label={openModules[module.id] ? "ocultar clases" : "mostrar clases"}
                  sx={{ p: 0.5 }}
                >
                  {openModules[module.id] ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </ListItem>

              {/* Clases dentro del Módulo (Colapsable) */}
              <Collapse in={openModules[module.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {module.classes?.map((clase) => {
                    const isSelected = selectedVideoId === clase.id;
                    const isCompleted = completedVideos.includes(clase.id);

                    return (
                      <ListItem
                        key={clase.id}
                        sx={{
                          cursor: "pointer",
                          padding: "8px 15px 8px 30px",
                          "&:hover": { backgroundColor: "#80c8db" },
                          backgroundColor: isSelected
                            ? "#6C4DE2"
                            : isCompleted
                              ? "#0B8DB5"
                              : "transparent",
                          borderRadius: "4px",
                          marginBottom: "2px",
                        }}
                        onClick={() => handleChangeVideo(clase)}
                      >
                        <ListItemText
                          primary={clase.title}
                          sx={{
                            textDecoration: isCompleted ? "line-through" : "none",
                            color: isSelected || isCompleted ? "white" : "#211E26",
                            flexGrow: 1,
                          }}
                        />
                        <Box
                          sx={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: isSelected || isCompleted ? "white" : "#211E26",
                            ml: 1,
                          }}
                          onClick={(e) => handleToggleCompleted(clase.id, e)}
                        >
                          {isCompleted ? (
                            <CheckCircleIcon />
                          ) : (
                            <CheckCircleOutlineIcon />
                          )}
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default VideoList;