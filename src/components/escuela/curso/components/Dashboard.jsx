// src/Dashboard.jsx
import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import CourseModulesManager from './modulos/CourseModulesManager'; // Asegúrate de que la ruta sea correcta

// Datos de cursos simulados para la demostración
const mockCourses = [
    { id: 18, titulo: "Nuevo de prueba con categoria 23" },
    { id: 102, titulo: "Introducción a la Inteligencia Artificial" },
    { id: 103, titulo: "Diseño Gráfico con Figma" },
];

const DashboardGestion = () => {
    // Estado para guardar el curso seleccionado
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
    };

    const handleBackToCourseSelection = () => {
        setSelectedCourse(null);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            {!selectedCourse ? (
                // Vista de selección de cursos
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                        Selecciona un Curso para Administrar
                    </Typography>
                    <Grid container spacing={3} justifyContent="center">
                        {mockCourses.map((course) => (
                            <Grid item key={course.id} xs={12} sm={6} md={4}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: '#e0e0e0',
                                            transform: 'scale(1.02)',
                                            transition: 'transform 0.2s ease-in-out',
                                        },
                                    }}
                                    onClick={() => handleSelectCourse(course)}
                                >
                                    <Typography variant="h6">{course.titulo}</Typography>
                                    <Typography variant="body2" color="text.secondary">ID: {course.id}</Typography>
                                    <Button variant="contained" sx={{ mt: 2 }} size="small">
                                        Administrar Módulos
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ) : (
                // Vista de gestión de módulos y clases para el curso seleccionado
                <Box>
                    <Button
                        onClick={handleBackToCourseSelection}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    >
                        ← Volver a Selección de Cursos
                    </Button>
                    <CourseModulesManager
                        courseId={selectedCourse.id}
                        courseTitle={selectedCourse.titulo}
                    />
                </Box>
            )}
        </Box>
    );
};

export default DashboardGestion;