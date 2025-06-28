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
        
        // **DEBUG**: Imprime la respuesta de categorías
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
        
        // **DEBUG**: Imprime la categoría encontrada
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

        // **DEBUG**: Imprime la respuesta de cursos (¡ESTE ES CLAVE!)
        console.log("Respuesta de API de cursos (directa):", coursesData); 
        
        let allFetchedCourses;

        // **CORRECCIÓN CLAVE:** Verificamos la estructura real de tu JSON de cursos
        // Basado en interacciones previas, a veces `cursos` está directamente, a veces anidado.
        if (coursesData.status === "success" && coursesData.cursos && Array.isArray(coursesData.cursos.cursos)) {
            // Caso: Los cursos están en `coursesData.cursos.cursos`
            allFetchedCourses = coursesData.cursos.cursos;
            console.log("Cursos encontrados en coursesData.cursos.cursos:", allFetchedCourses);
        } else if (coursesData.status === "success" && Array.isArray(coursesData.cursos)) {
            // Caso: Los cursos están directamente en `coursesData.cursos`
            allFetchedCourses = coursesData.cursos;
            console.log("Cursos encontrados en coursesData.cursos:", allFetchedCourses);
        } else {
            // Si ninguna de las estructuras esperadas se cumple, lanza un error claro
            throw new Error(coursesData.message || "Datos de cursos inválidos: La estructura del array de cursos no es la esperada.");
        }
        
        // Filtrar los cursos por el ID de la categoría encontrada y que estén "Publicado"
        const filteredCourses = allFetchedCourses.filter(
          (curso) =>
            String(curso.categoria_id) === String(foundCategory.id) &&
            curso.estado === "Publicado"
        );
        setCourses(filteredCourses);
        
        // **DEBUG**: Imprime los cursos filtrados
        console.log("Cursos filtrados por categoría:", filteredCourses);

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
            <Grid item key={curso.id}> {/* Asegúrate de usar la key correcta, si tu API devuelve 'id_curso', úsalo */}
              <CursoCard
                title={curso.titulo}
                subtitle={curso.descripcion_corta}
                banner={curso.portada_targeta} // ¡Aquí la corrección! Usa 'url_banner'
                accessLink={`/curso/${curso.id}`} // Ajusta si el ID del curso es diferente (ej. 'curso.id_curso')
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