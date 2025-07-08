import React from "react";
import VideoLayout from "./layout"; 
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom"; 

const PasosIniciales = () => {
  const { courseId } = useParams();

  if (!courseId) {

    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Error: No se ha especificado un ID de curso.
        </Typography>
        <Typography variant="body1">
          Por favor, acceda a través de una ruta de curso válida.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <VideoLayout courseId={courseId} />
    </Box>
  );
};

export default PasosIniciales;