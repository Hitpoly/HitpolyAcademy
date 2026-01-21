import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import CursoCard from "../../../components/cards/CursoCard";

const parseDurationToDays = (durationString) => {
  if (!durationString) return null;
  const parts = durationString.toLowerCase().match(/(\d+)\s*(dia|dias|mes|meses|hora|horas)/);
  if (!parts) return null;

  const value = parseInt(parts[1], 10);
  const unit = parts[2];

  if (isNaN(value)) return null;

  switch (unit) {
    case 'dia':
    case 'dias': return value;
    case 'hora':
    case 'horas': return value / 24;
    case 'mes':
    case 'meses': return value * 30;
    default: return null;
  }
};

const SectionTwo = () => {
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [catRes, cursRes] = await Promise.all([
          fetch("https://apiacademy.hitpoly.com/ajax/getCategoriasController.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getcategorias" }),
          }),
          fetch("https://apiacademy.hitpoly.com/ajax/traerCursosController.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getCursos" }),
          }),
        ]);

        const categoriesData = await catRes.json();
        const coursesData = await cursRes.json();

        const categoryMap = categoriesData.categorias.reduce((map, cat) => {
          map[cat.id] = cat.nombre;
          return map;
        }, {});

        // Filtro lógico: Publicados y duración <= 30 días
        const filteredCourses = (coursesData.cursos.cursos || []).filter((curso) => {
          const isPublished = curso.estado === "Publicado";
          const durationInDays = parseDurationToDays(curso.duracion_estimada);
          return isPublished && (durationInDays !== null && durationInDays <= 30);
        });

        // Obtener nombres de instructores de forma única
        const uniqueProfIds = [...new Set(filteredCourses.map(c => c.profesor_id))];
        const instructorPromises = uniqueProfIds.map(async (id) => {
          try {
            const res = await fetch("https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getAlumnoProfesor", id }),
            });
            const data = await res.json();
            return { id, name: data.status === "success" ? `${data.usuario.nombre} ${data.usuario.apellido}` : "Instructor Academia" };
          } catch {
            return { id, name: "Instructor Academia" };
          }
        });

        const instructors = await Promise.all(instructorPromises);
        const instMap = instructors.reduce((m, i) => ({ ...m, [i.id]: i.name }), {});

        const organized = filteredCourses.reduce((acc, curso) => {
          const catName = categoryMap[curso.categoria_id] || "Otros";
          if (!acc[catName]) acc[catName] = [];
          acc[catName].push({
            id: curso.id,
            title: curso.titulo,
            subtitle: curso.subtitulo,
            banner: curso.portada_targeta,
            accessLink: `/curso/${curso.id}`,
            instructorName: instMap[curso.profesor_id] || "Instructor",
            rating: curso.valoracion || 0,
            price: `${curso.precio} ${curso.moneda}`,
            reviews: curso.numero_resenas || 0,
            level: curso.nivel
          });
          return acc;
        }, {});

        setCoursesByCategory(organized);
        if (Object.keys(organized).length > 0) setActiveCategoryName(Object.keys(organized)[0]);
      } catch (err) {
        setError("Error al cargar la sección de cursos cortos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentCourses = useMemo(() => coursesByCategory[activeCategoryName] || [], [activeCategoryName, coursesByCategory]);

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Typography variant="h3" pb={4} pt={3}>
        Los mejores cursos de un mes o menos
      </Typography>

      <Box sx={{ border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden", bgcolor: "#fff" }}>
        {/* PESTAÑAS */}
        <Box sx={{ display: "flex", width: "100%", borderBottom: "1px solid #ddd", overflowX: "auto" }}>
          {Object.keys(coursesByCategory).map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategoryName(category)}
              sx={{
                flex: 1, minWidth: "fit-content", py: 2, borderRadius: 0, textTransform: "none", fontWeight: "bold",
                bgcolor: activeCategoryName === category ? "#6F4CE0" : "transparent",
                color: activeCategoryName === category ? "#fff" : "#6F4CE0",
                "&:hover": { bgcolor: activeCategoryName === category ? "#5a3ecc" : "#f8f9fa" }
              }}
            >
              {category}
            </Button>
          ))}
        </Box>

        {/* CONTENEDOR DE SCROLL HORIZONTAL (IDÉNTICO A SECCIÓN 1) */}
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 4, 
            p: 3,
            scrollSnapType: "x proximity", 
            scrollPaddingLeft: "24px", 
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { height: "6px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#ccc", borderRadius: "10px" },
            "&::after": { content: '""', minWidth: "30px" } 
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", py: 5 }}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>
          ) : currentCourses.length > 0 ? (
            currentCourses.map((course) => (
              <Box
                key={course.id}
                sx={{
                  flex: "0 0 auto",
                  width: { xs: "60%", sm: "50%", md: "28%" }, 
                  scrollSnapAlign: "start",
                }}
              >
                <CursoCard {...course} />
              </Box>
            ))
          ) : (
            <Typography sx={{ p: 4 }}>No hay cursos cortos en esta categoría.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SectionTwo;