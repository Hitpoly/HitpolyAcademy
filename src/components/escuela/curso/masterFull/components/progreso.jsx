// ProgressBar.jsx
import React from "react";
import { LinearProgress, Box, Typography }
from "@mui/material"; // Eliminamos Alert y CircularProgress ya que no los usaremos aquí

const ProgressBar = ({ totalVideos = 0, completedVideosCount = 0 }) => {
  // Ya no necesitamos manejar loading o error aquí, se asume que VideoLayout
  // maneja la carga inicial y la barra siempre reflejará el estado local.

  // Calcula el porcentaje de progreso con los datos pasados por props
  const progress = totalVideos > 0 ? (completedVideosCount / totalVideos) * 100 : 0;
  console.log(`ProgressBar: Progreso calculado: ${Math.round(progress)}% (${completedVideosCount} de ${totalVideos} videos completados).`);

  return (
    <Box sx={{ width: "100%", padding: "20px" }}>
      <Typography variant="h6" sx={{ marginBottom: "10px" }}>
        Progreso del Curso
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: "10px",
          borderRadius: "5px",
          backgroundColor: "#e0f7fa",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#00796b",
          },
        }}
      />
      <Typography variant="body2" sx={{ marginTop: "10px" }}>
        {`${completedVideosCount} de ${totalVideos} videos completados (${Math.round(progress)}%)`}
      </Typography>
    </Box>
  );
};

export default ProgressBar;