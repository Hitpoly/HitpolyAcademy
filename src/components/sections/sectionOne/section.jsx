import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useFetchCourses } from "./hooks/useFetchCourses"; // Ajusta la ruta
import CategoryTabs from "./CategoryTabs";
import CourseCarousel from "./CourseCarousel";

const SectionCardGrid = () => {
  const { coursesByCategory, loading, error } = useFetchCourses();
  const [activeCategoryName, setActiveCategoryName] = useState("");

  // ✅ Cambiamos useMemo por useEffect para establecer la categoría inicial
  useEffect(() => {
    if (!activeCategoryName && Object.keys(coursesByCategory).length > 0) {
      setActiveCategoryName(Object.keys(coursesByCategory)[0]);
    }
  }, [coursesByCategory, activeCategoryName]);

  const currentCourses = coursesByCategory[activeCategoryName] || [];

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", my: 5 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Typography variant="h3" pb={4} pt={3}>
        Las mejores habilidades en tendencia
      </Typography>

      <Box sx={{ border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden", bgcolor: "#fff" }}>
        <CategoryTabs 
          categories={Object.keys(coursesByCategory)} 
          activeCategory={activeCategoryName}
          onCategoryChange={setActiveCategoryName}
        />
        
        <CourseCarousel courses={currentCourses} />
      </Box>
    </Box>
  );
};

export default SectionCardGrid;