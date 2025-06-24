import React from "react";
import VideoLayout from "./layout"; // Asegúrate de que la ruta sea correcta
import { Box } from "@mui/material";
import { useParams } from "react-router-dom"; // Si courseId viene de la URL

// El array 'activities' ya no se usa directamente aquí,
// ya que los datos se cargarán desde la API
// const activities = [...]

const PasosIniciales = () => {
  // Si courseId viene de la URL, descomenta la siguiente línea
  // const { courseId } = useParams();

  // Por ahora, asumamos un courseId fijo para la demostración
  // DEBES REEMPLAZAR '1' CON EL ID DEL CURSO REAL
  const courseId = '70'; // <-- IMPORTANTE: Usa el ID del curso que gestiona estos módulos y clases

  return (
    <Box>
      {/* Pasamos el courseId a VideoLayout para que cargue los datos */}
      <VideoLayout courseId={courseId} />
    </Box>
  );
};

export default PasosIniciales;