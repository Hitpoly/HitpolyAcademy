// src/components/InProgressCoursesSection.jsx
import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import CourseCard from "../../cards/CourseCardProgress";

const InProgressCoursesSection = ({ courses }) => {
  return (
    <Box
      sx={{
        flex: { xs: "0 0 100%", md: "100%" },
        mb: { xs: 3, md: 0 },
        maxHeight: "100%",
        p: { xs: 3, md: 4 },
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
        Cursos en Progreso
      </Typography>
      <Stack spacing={3}>
        {courses.map((curso) => (
          <CourseCard key={curso.id} curso={curso} />
        ))}
      </Stack>
    </Box>
  );
};

export default InProgressCoursesSection;