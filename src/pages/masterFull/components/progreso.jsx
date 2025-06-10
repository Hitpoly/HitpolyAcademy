import React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

const ProgressBar = ({ completedVideos, totalVideos }) => {
  const progress = (completedVideos.length / totalVideos) * 100;

  return (
    <>
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
          {`${
            completedVideos.length
          } de ${totalVideos} videos completados (${Math.round(progress)}%)`}
        </Typography>
      </Box>
    </>
  );
};

export default ProgressBar;
