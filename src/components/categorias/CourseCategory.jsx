import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import CursoCard from "../cards/CursoCard"; 

const mockInstructorNames = {
  1: "Juan Pérez",
  2: "María García",
  3: "Profesor Delgado",
  4: "Ana López",

};

const CourseCategory = () => {
  const { categoryName } = useParams(); 
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryCourses = async () => {
      setLoading(true);
      setError(null);
      setCourses([]); 

      try {
        const categoriesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getcategorias" }),
          }
        );

        if (!categoriesResponse.ok) {
          throw new Error(`Error al cargar categorías: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.status !== "success" || !Array.isArray(categoriesData.categorias)) {
          throw new Error(categoriesData.message || "Datos de categorías inválidos.");
        }

        const foundCategory = categoriesData.categorias.find(
          (cat) => cat.nombre.toLowerCase() === categoryName.toLowerCase()
        );

        if (!foundCategory) {
          setError(`No se encontró la categoría "${categoryName}".`);
          setLoading(false);
          return;
        }
        
        const coursesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getCursos" }),
          }
        );

        if (!coursesResponse.ok) {
          throw new Error(`Error al cargar cursos: ${coursesResponse.statusText}`);
        }
        const coursesData = await coursesResponse.json();
        let allFetchedCourses;

        if (coursesData.status === "success" && coursesData.cursos && Array.isArray(coursesData.cursos.cursos)) {
            allFetchedCourses = coursesData.cursos.cursos;
            } else if (coursesData.status === "success" && Array.isArray(coursesData.cursos)) {
            allFetchedCourses = coursesData.cursos;
            } else {
            throw new Error(coursesData.message || "Datos de cursos inválidos: La estructura del array de cursos no es la esperada.");
        }
        
        const filteredCourses = allFetchedCourses.filter(
          (curso) =>
            String(curso.categoria_id) === String(foundCategory.id) &&
            curso.estado === "Publicado"
        );
        
        const mappedCourses = filteredCourses.map(curso => ({
            id: curso.id,
            title: curso.titulo,
            subtitle: curso.subtitulo,
            banner: curso.portada_targeta,
            accessLink: `/curso/${curso.id}`,
            instructorName: mockInstructorNames[curso.profesor_id] || "Instructor Desconocido", // Usamos el mock
            totalHours: curso.duracion_estimada,
            price: `${curso.precio} ${curso.moneda}`,
            level: curso.nivel,
            classType: curso.tipo_clase || null, 
        }));

        setCourses(mappedCourses);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) { 
        fetchCategoryCourses();
    } else {
      setLoading(false);
      setError("Nombre de categoría no proporcionado en la URL.");
    }
  }, [categoryName]); 
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 80px)", 
          mt: '80px', 
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando cursos de "{categoryName}"...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, mt: '80px' }}> 
        <Alert severity="error">
          Error al cargar los cursos: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: '10px' }}> 
      <Typography variant="h4" gutterBottom>
        Cursos de: {categoryName}
      </Typography>
      {courses.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {courses.map((curso) => (
            <Grid item key={curso.id}> 
              <CursoCard
                title={curso.title}
                subtitle={curso.subtitle}
                banner={curso.banner}
                accessLink={curso.accessLink}
                instructorName={curso.instructorName}
                totalHours={curso.totalHours}
                price={curso.price}
                level={curso.level}
                classType={curso.classType}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          No se encontraron cursos para la categoría "{categoryName}".
        </Typography>
      )}
    </Box>
  );
};

export default CourseCategory;