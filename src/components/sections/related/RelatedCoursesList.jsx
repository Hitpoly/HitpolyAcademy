import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Stack } from "@mui/material";
import SmallCourseCard from "../../cards/SmallCourseCard";

const RelatedCoursesList = ({ currentCourseId, categoriaId, profesorId, isStacked }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://apiacademy.hitpoly.com/ajax/traerCursosController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursos" }),
        });
        const data = await res.json();
        
        if (data.status === "success" || data.cursos) {
          const allCursos = data.cursos || [];
          
          const filtered = allCursos.filter(c => 
            String(c.id) !== String(currentCourseId) &&
            String(c.categoria_id) === String(categoriaId) &&
            String(c.profesor_id) === String(profesorId) &&
            c.estado === "Publicado"
          ).map(c => ({
            id: c.id,
            title: c.titulo,
            portada_targeta: c.portada_targeta,
            price: `${c.precio} ${c.moneda}`
          }));

          setCourses(filtered);
        }
      } catch (e) {
        console.error("[RELATED] Error fetching related courses:", e);
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId && profesorId) {
      fetchRelated();
    }
  }, [currentCourseId, categoriaId, profesorId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={24} sx={{ color: "#fff" }} />
      </Box>
    );
  }

  if (courses.length === 0) return null;

  return (
    <Box sx={{ mt: 3, width: "100%" }}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: "text.primary", opacity: 0.8, mb: 2 }}>
        Cursos relacionados del mismo profesor:
      </Typography>
      <Stack spacing={2}>
        {courses.map((course) => (
          <Box key={course.id} sx={{ 
            transition: "transform 0.2s", 
            "&:hover": { transform: "scale(1.02)" } 
          }}>
            <SmallCourseCard course={course} horizontal={isStacked} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default RelatedCoursesList;
