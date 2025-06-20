import React, { useState } from "react"; // ¡Importante: useState fue añadido aquí!
import { Box, List, ListItem, ListItemText, Typography, Collapse, IconButton } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const VideoLista = ({
  modules = [], // Valor por defecto: array vacío para evitar errores si 'modules' es undefined
  onSelectVideo,
  completedVideos,
  toggleCompletedVideo,
  selectedVideoId,
}) => {
  // Estado para controlar la expansión/colapso de cada módulo
  const [openModules, setOpenModules] = useState({});

  // Maneja el clic en un módulo para expandir/colapsar
  const handleModuleClick = (moduleId) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Maneja el cambio de video/clase.
  const handleChangeVideo = (clase) => {
    onSelectVideo(clase);
  };

  // Maneja el marcado/desmarcado de una clase como completada
  const handleToggleCompleted = (claseId, event) => {
    event.stopPropagation(); // Evita que se dispare también el cambio de video
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
        borderRadius: '8px', // Añadido para mejor estética
        boxShadow: '0px 2px 10px rgba(0,0,0,0.1)' // Añadido para mejor estética
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
                button
                onClick={() => handleModuleClick(module.id)}
                sx={{
                  backgroundColor: "#e0f2f7", // Color de fondo para módulos
                  marginBottom: "5px",
                  borderRadius: "4px",
                  '&:hover': {
                    backgroundColor: "#b2ebf2",
                  },
                  fontWeight: 'bold',
                  color: "#006064",
                }}
              >
                <ListItemText primary={`Módulo ${module.order || 'N/A'}: ${module.title}`} />
                <IconButton onClick={() => handleModuleClick(module.id)}>
                  {openModules[module.id] ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </ListItem>

              {/* Clases dentro del Módulo (Colapsable) */}
              <Collapse in={openModules[module.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {module.classes?.map((clase) => { // Uso de '?.map' para seguridad
                    const isSelected = selectedVideoId === clase.id;
                    const isCompleted = completedVideos.includes(clase.id);

                    return (
                      <ListItem
                        key={clase.id}
                        sx={{
                          cursor: "pointer",
                          padding: "8px 15px 8px 30px", // Más padding a la izquierda para indentación
                          "&:hover": { backgroundColor: "#80c8db" },
                          backgroundColor: isSelected
                            ? "#6C4DE2" // Color para la clase seleccionada
                            : isCompleted
                              ? "#0B8DB5" // Color para la clase completada
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
                            flexGrow: 1, // Permite que el texto ocupe el espacio
                          }}
                        />
                        <Box
                          sx={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: isSelected || isCompleted ? "white" : "#211E26",
                            ml: 1, // Margen izquierdo para separar del texto
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

export default VideoLista;