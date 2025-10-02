import React, { useState, useEffect } from "react";
import { Box, List, ListItem, ListItemText, Typography, Collapse, IconButton } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; 
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


const VideoList = ({
  modules = [],
  onSelectVideo,
  completedVideos,
  toggleCompletedVideo,
  selectedVideoId, 
}) => {
  // Estado para controlar qué módulos están abiertos
  const [openModules, setOpenModules] = useState({});

  // Efecto 1: Abrir el primer módulo por defecto al cargar
  useEffect(() => {
    if (modules.length > 0) {
      const firstModuleId = modules[0].id;
      setOpenModules({
        [firstModuleId]: true  
      });
    }
  }, [modules]); 
  
  useEffect(() => {
    if (!selectedVideoId) return;

    // 1. Buscamos a qué módulo pertenece esta clase seleccionada.
    const classModule = modules.find(module => 
      module.classes?.some(clase => clase.id === selectedVideoId)
    );
    
    if (!classModule) {
        return;
    }

    const newModuleId = classModule.id;
    setOpenModules({
      [newModuleId]: true
    });

    const scrollTimeout = setTimeout(() => {
      const element = document.getElementById(`video-item-${selectedVideoId}`);
      
      if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center", 
          });
      } else {
          }
    }, 300); 
    return () => clearTimeout(scrollTimeout);
    
  }, [selectedVideoId, modules]); 


  // ✅ handleModuleClick: Mantiene la lógica manual de un solo módulo abierto (o ninguno).
  const handleModuleClick = (moduleId) => {
    setOpenModules(prev => {
      const isOpen = !prev[moduleId];
      if (isOpen) {
        return {
          [moduleId]: true
        };
      } else {
        return {}; 
      }
    });
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
        Contenido del Curso 📚
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List component="nav">
          {modules.map((module) => (
            <React.Fragment key={module.id}>
              <ListItem
                onClick={() => handleModuleClick(module.id)} 
                sx={{
                  backgroundColor: "#e0f2f7",
                  marginBottom: "5px",
                  borderRadius: "4px",
                  fontWeight: 'bold',
                  color: "#006064",
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer', 
                }}
              >
                <ListItemText
                  primary={`Módulo ${module.order || 'N/A'}: ${module.title}`}
                />
                <IconButton
                  aria-label={openModules[module.id] ? "ocultar clases" : "mostrar clases"}
                  sx={{ p: 0.5 }}
                >
                  {openModules[module.id] ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </ListItem>

              <Collapse in={openModules[module.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {module.classes?.map((clase) => {
                    const isSelected = selectedVideoId === clase.id;
                    const isCompleted = completedVideos.includes(clase.id);

                    return (
                      <ListItem
                        key={clase.id}
                        id={`video-item-${clase.id}`} 
                        sx={{
                          cursor: "pointer",
                          padding: "8px 15px 8px 30px",
                          "&:hover": { backgroundColor: isSelected ? "#5A3EB2" : "#80c8db" },
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