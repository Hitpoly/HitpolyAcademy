import React, { useState } from "react";
import { Box, List, ListItem, ListItemText, Typography, Collapse, IconButton } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const VideoLista = ({
  modules = [],
  onSelectVideo,
  completedVideos,
  toggleCompletedVideo,
  selectedVideoId,
}) => {
  const [openModules, setOpenModules] = useState({});

  const handleModuleClick = (moduleId) => {
    setOpenModules(prev => ({
      ...prev,
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
                // *** CAMBIO AQUÍ: Eliminamos el 'button' y el 'onClick' del ListItem principal ***
                // Ya que solo queremos que el icono controle el colapso/expansión.
                // Si quieres que todo el ListItem sea cliqueable para expandir, puedes dejarlo
                // pero entonces no necesitarías el IconButton para la misma función.
                // Para que el icono sea el único controlador visual, lo removemos.
                sx={{
                  backgroundColor: "#e0f2f7",
                  marginBottom: "5px",
                  borderRadius: "4px",
                  // Si prefieres que al clicar en cualquier parte del modulo se expanda
                  // entonces mantén el 'button' y el 'onClick' aquí y elimina el 'onClick' del IconButton
                  // '&:hover': {
                  //   backgroundColor: "#b2ebf2",
                  // },
                  fontWeight: 'bold',
                  color: "#006064",
                  display: 'flex', // Asegura que los elementos internos se alineen
                  justifyContent: 'space-between', // Para empujar el icono a la derecha
                  alignItems: 'center', // Centra verticalmente los elementos
                }}
              >
                <ListItemText
                  primary={`Módulo ${module.order || 'N/A'}: ${module.title}`}
                  // Opcional: Si quieres que el texto del módulo también sea cliqueable
                  // onClick={() => handleModuleClick(module.id)}
                  // sx={{ cursor: 'pointer' }}
                />
                {/* El IconButton es el único que controla la expansión/colapso */}
                <IconButton
                  onClick={() => handleModuleClick(module.id)}
                  aria-label={openModules[module.id] ? "ocultar clases" : "mostrar clases"}
                  sx={{ p: 0.5 }} // Padding más pequeño para el icono
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

export default VideoLista;