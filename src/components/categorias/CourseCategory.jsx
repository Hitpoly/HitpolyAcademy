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

// Eliminamos mockInstructorNames porque ahora obtendremos los datos de la API

const CourseCategory = () => {
  const { categoryName } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [instructorNamesMap, setInstructorNamesMap] = useState({});
  const [categoryDescription, setCategoryDescription] = useState(""); // Nuevo estado para la descripción de la categoría

  useEffect(() => {
    const fetchCategoryCourses = async () => {
      setLoading(true);
      setError(null);
      setCourses([]);
      setInstructorNamesMap({});
      setCategoryDescription(""); // Resetear la descripción al inicio

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
          const errorText = await categoriesResponse.text();
          throw new Error(`Error al cargar categorías: ${categoriesResponse.statusText}. Detalles: ${errorText}`);
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

        // Establecer la descripción de la categoría si existe
        if (foundCategory.descripcion) {
          setCategoryDescription(foundCategory.descripcion);
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
          const errorText = await coursesResponse.text();
          throw new Error(`Error al cargar cursos: ${coursesResponse.statusText}. Detalles: ${errorText}`);
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

        const uniqueInstructorIds = [
          ...new Set(filteredCourses.map((curso) => curso.profesor_id)),
        ].filter(id => id);

        const instructorPromises = uniqueInstructorIds.map(async (id) => {
          try {
            const instructorResponse = await fetch(
              "https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "getAlumnoProfesor", id: id }),
              }
            );
            if (!instructorResponse.ok) {
              console.error(`Error al cargar el instructor ${id}: ${instructorResponse.statusText}`);
              return { id, name: "Instructor Desconocido" };
            }
            const instructorData = await instructorResponse.json();
            if (instructorData.status === "success" && instructorData.usuario) {
              return {
                id,
                name: `${instructorData.usuario.nombre} ${instructorData.usuario.apellido}`,
              };
            } else {
              console.warn(`Datos de instructor ${id} inválidos:`, instructorData.message);
              return { id, name: "Instructor Desconocido" };
            }
          } catch (fetchErr) {
            console.error(`Excepción al cargar el instructor ${id}:`, fetchErr);
            return { id, name: "Instructor Desconocido" };
          }
        });

        const newInstructorNamesMap = await Promise.all(instructorPromises).then(resolvedInstructors =>
          resolvedInstructors.reduce((map, instructor) => {
            map[instructor.id] = instructor.name;
            return map;
          }, {})
        );
        setInstructorNamesMap(newInstructorNamesMap);

        const mappedCourses = filteredCourses.map(curso => ({
          id: curso.id,
          title: curso.titulo,
          subtitle: curso.subtitulo,
          banner: curso.portada_targeta,
          accessLink: `/curso/${curso.id}`,
          instructorName: newInstructorNamesMap[curso.profesor_id] || "Instructor Desconocido",
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
      {/* Banner dinámico por categoría */}
      <Box
        sx={{
          backgroundColor: "#283149", // Fondo oscuro
          color: "white",
          p: 4,
          borderRadius: "8px",
          mb: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "150px", // Altura mínima para el banner
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
          HitpolyAcademy | Explorar Categorías
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            "& span": {
              color: "#FF6F61", // Color destacado
            },
          }}
        >
          Cursos de <span>{categoryName}</span>
        </Typography>
        {categoryDescription && ( // Mostrar descripción si existe
          <Typography variant="body1" sx={{ maxWidth: "70%", mb: 2 }}>
            {categoryDescription}
          </Typography>
        )}
      </Box>
      {/* Fin del banner dinámico */}

      {courses.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {courses.map((curso) => (
            <Grid item key={curso.id} xs={12} sm={6} md={4} lg={3}>
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