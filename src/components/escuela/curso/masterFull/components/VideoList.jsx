import React, { useState, useEffect } from "react";
import { Box, List, ListItem, ListItemText, Typography, Collapse, IconButton } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; 
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const VideoList = ({
  modules = [],
  onSelectVideo,
  completedVideos = [], // Aseguramos default para evitar errores de .includes
  toggleCompletedVideo,
  selectedVideoId, 
}) => {
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
  }, [modules, completedVideos, selectedVideoId]);

  useEffect(() => {
    if (modules.length > 0 && Object.keys(openModules).length === 0) {
      const firstModuleId = modules[0].id;
      setOpenModules({ [firstModuleId]: true });
    }
  }, [modules]); 
  
  useEffect(() => {
    if (!selectedVideoId) return;

    if (classModule) {
      setOpenModules({ [classModule.id]: true });
      
      // Eliminamos el scrollIntoView para evitar conflictos
      // El scroll al reproductor de video será manejado por layout.jsx
    }
  }, [selectedVideoId, modules]);

  const handleModuleClick = (moduleId) => {
    setOpenModules(prev => ({
      [moduleId]: !prev[moduleId]
    }));
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
                  cursor: 'pointer', 
                }}
              >
                <ListItemText primary={`Módulo: ${module.title}`} />
                {openModules[module.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              <Collapse in={openModules[module.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {module.classes?.map((clase) => {
                    const isSelected = Number(selectedVideoId) === Number(clase.id);
                    
                    // 🔴 LOG DE COMPARACIÓN: Aquí detectaremos si hay un fallo de tipos (String vs Number)
                    const isCompleted = completedVideos.some(cvId => {
                        const match = Number(cvId) === Number(clase.id);
                        if (match) {
                           // Solo loguear cuando encuentra una coincidencia para no saturar

                        }
                        return match;
                    });

                    return (
                      <ListItem
                        key={clase.id}
                        id={`video-item-${clase.id}`} 
                        sx={{
                          cursor: "pointer",
                          padding: "8px 15px 8px 30px",
                          backgroundColor: isSelected ? "#6C4DE2" : isCompleted ? "#0B8DB5" : "transparent",
                          color: isSelected || isCompleted ? "white" : "#211E26",
                          borderRadius: "4px",
                          marginBottom: "2px",
                          "&:hover": { backgroundColor: isSelected ? "#5A3EB2" : "#80c8db" },
                        }}
                        onClick={() => onSelectVideo(clase)}
                      >
                        <ListItemText
                          primary={clase.title}
                          sx={{ textDecoration: isCompleted ? "line-through" : "none" }}
                        />
                        <Box
                          sx={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            p: 1, // Área de clic más grande
                            zIndex: 10
                          }}
                          onClick={(e) => handleToggleCompleted(clase.id, e)}
                        >
                          {isCompleted ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
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