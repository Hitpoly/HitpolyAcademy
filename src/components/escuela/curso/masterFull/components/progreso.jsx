import React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

const ProgressBar = ({ totalVideos = 0, completedVideosCount = 0 }) => {
  // Evitamos que completed sea mayor que total por cualquier desajuste de datos
  const safeCompleted = Math.min(completedVideosCount, totalVideos);
  
  const progress = totalVideos > 0 ? (safeCompleted / totalVideos) * 100 : 0;

  return (
    <Box sx={{ width: "100%", padding: "20px", backgroundColor: "#fff", borderRadius: "8px", mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
        Tu progreso en este curso
      </Typography>
      
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: "12px",
          borderRadius: "6px",
          backgroundColor: "#f0f0f0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#00796b", // Color verde oscuro
            borderRadius: "6px",
          },
        }}
      />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        <Typography variant="body2" color="textSecondary">
          {safeCompleted} de {totalVideos} clases finalizadas
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#00796b" }}>
          {Math.round(progress)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default ProgressBar;