import React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

const ProgressBar = ({ totalVideos = 0, completedVideosCount = 0 }) => {
  // Aseguramos que el progreso nunca supere el 100%
  const calculatedProgress =
    totalVideos > 0 ? (completedVideosCount / totalVideos) * 100 : 0;
  
  const progress = Math.min(100, calculatedProgress);

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