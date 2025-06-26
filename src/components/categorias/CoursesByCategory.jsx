// components/categorias/CourseCategory.jsx (Tu CourseGrid renombrado, con ajuste para la prop 'courses')
import React from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import CursoCard from '../cards/CursoCard';

const CourseCategory = ({ courses, categoryMap, loading, error, selectedCategoryId }) => {
  // Aseguramos que 'courses' sea siempre un array para evitar el error 'length'
  const coursesToRender = Array.isArray(courses) ? courses : []; 

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando cursos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar los cursos: {error}</Alert>
      </Box>
    );
  }

  // Si el título ya lo maneja el popup padre, puedes simplificar esto
  // O ajustarlo para un subtítulo si lo deseas.
  const categoryTitle = selectedCategoryId
    ? categoryMap[selectedCategoryId]
    : "Todos los Cursos"; 

  return (
    <Box sx={{ p: 3 }}>
      {/* Puedes dejar este Typography si quieres que el CourseCategory también tenga su propio título */}
      {/* <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        Cursos en {categoryTitle}
      </Typography> */}
      
      {/* Usamos coursesToRender aquí */}
      {coursesToRender.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center">
          No hay cursos disponibles.
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {coursesToRender.map(course => (
            <Grid item key={course.id} xs={12} sm={6} md={4} lg={3}>
              <CursoCard
                title={course.titulo}
                subtitle={course.subtitulo}
                banner={course.miniatura_imagen}
                accessLink={`/curso/${course.id}`}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CourseCategory;