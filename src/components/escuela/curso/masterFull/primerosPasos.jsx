import React from "react";
import VideoLayout from "./layout"; // Asegúrate de que la ruta sea correcta
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom"; // Importa useParams

const PasosIniciales = () => {
  // ***** CAMBIO AQUÍ: Obtenemos el courseId de los parámetros de la URL *****
  const { courseId } = useParams();

  // Ahora, courseId ya no es fijo, se obtiene de la URL
  // console.log("PasosIniciales - courseId de la URL:", courseId); // Para depuración

  if (!courseId) {
    // Manejo de error si no se proporciona un courseId en la URL
    // Podrías redirigir o mostrar un mensaje de error
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
      {/* Pasamos el courseId dinámico a VideoLayout */}
      <VideoLayout courseId={courseId} />
    </Box>
  );
};

export default PasosIniciales;