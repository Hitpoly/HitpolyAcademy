import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import CursoCard from "../cards/CursoCard"; // ¡Asegúrate de que esta ruta sea correcta!

// --- SIMULACIÓN DE DATOS DEL PROFESOR (replicado de SectionCardGrid) ---
// En un caso real, esto vendría de una API o un contexto compartido.
// Aquí simulamos un mapeo de IDs de profesor a nombres.
const mockInstructorNames = {
  1: "Juan Pérez",
  2: "María García",
  3: "Profesor Delgado", // Nombre para el profesor_id: 3
  4: "Ana López",
  // Agrega más según necesites
};

const CourseCategory = () => {
  const { categoryName } = useParams(); // Obtiene el nombre de la categoría de la URL
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryCourses = async () => {
      setLoading(true);
      setError(null);
      setCourses([]); // Limpiar cursos anteriores al cambiar de categoría

      try {
        // 1. Cargar todas las categorías para encontrar el ID de la categoría por su nombre
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
        
        console.log("Respuesta de API de categorías:", categoriesData);

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
        
        console.log("Categoría encontrada:", foundCategory);

        // 2. Cargar todos los cursos
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

        console.log("Respuesta de API de cursos (directa):", coursesData); 
        
        let allFetchedCourses;

        if (coursesData.status === "success" && coursesData.cursos && Array.isArray(coursesData.cursos.cursos)) {
            allFetchedCourses = coursesData.cursos.cursos;
            console.log("Cursos encontrados en coursesData.cursos.cursos:", allFetchedCourses);
        } else if (coursesData.status === "success" && Array.isArray(coursesData.cursos)) {
            allFetchedCourses = coursesData.cursos;
            console.log("Cursos encontrados en coursesData.cursos:", allFetchedCourses);
        } else {
            throw new Error(coursesData.message || "Datos de cursos inválidos: La estructura del array de cursos no es la esperada.");
        }
        
        // Filtrar los cursos por el ID de la categoría encontrada y que estén "Publicado"
        const filteredCourses = allFetchedCourses.filter(
          (curso) =>
            String(curso.categoria_id) === String(foundCategory.id) &&
            curso.estado === "Publicado"
        );
        
        // Mapear los cursos para que coincidan con los props de CursoCard
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
            classType: curso.tipo_clase || null, // Incluimos el tipo de clase
        }));

        setCourses(mappedCourses);
        
        console.log("Cursos filtrados y mapeados por categoría:", mappedCourses);

      } catch (err) {
        console.error("Error en CourseCategory:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) { // Solo ejecuta la carga si hay un categoryName en la URL
        fetchCategoryCourses();
    } else {
      setLoading(false);
      setError("Nombre de categoría no proporcionado en la URL.");
    }
  }, [categoryName]); // Vuelve a ejecutar este efecto cuando el `categoryName` en la URL cambia

  // Renderizado del componente
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 80px)", // Ajusta la altura, restando la altura de tu navbar
          mt: '80px', // Margen superior para evitar que el navbar fijo lo cubra
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando cursos de "{categoryName}"...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, mt: '80px' }}> {/* Margen superior para evitar que el navbar lo cubra */}
        <Alert severity="error">
          Error al cargar los cursos: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: '10px' }}> {/* Margen superior para evitar que el navbar lo cubra */}
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
                classType={curso.classType} // Pasamos el tipo de clase
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