// src/components/CompletedCoursesSection.jsx
import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const CompletedCoursesSection = ({ courses }) => {
  return (
    <Box
      sx={{
        flex: { xs: "0 0 100%", md: "1" },
        borderRight: { md: "1px solid #e0e0e0" },
        pr: { md: 4 },
        mb: { xs: 3, md: 0 },
        borderTop: { xs: "1px solid #e0e0e0", md: "none" },
        pt: { xs: 3, md: 4 },
        overflowY: { xs: "visible", md: "auto" },
        maxHeight: { xs: "none", md: "100%" },
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
        Cursos Culminados
      </Typography>
      <Stack spacing={2}>
        {courses.map((curso) => (
          <Box key={curso.id} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 24 }} />
            <Typography variant="body1">{curso.titulo}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default CompletedCoursesSection;