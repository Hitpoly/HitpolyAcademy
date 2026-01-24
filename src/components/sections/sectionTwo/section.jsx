import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import CursoCard from "../../../components/cards/CursoCard";

// Función auxiliar para duración
const parseDurationToDays = (durationString) => {
  if (!durationString) return null;
  const parts = durationString
    .toLowerCase()
    .match(/(\d+)\s*(dia|dias|mes|meses|hora|horas)/);
  if (!parts) return null;
  const value = parseInt(parts[1], 10);
  const unit = parts[2];
  if (isNaN(value)) return null;
  switch (unit) {
    case "dia":
    case "dias":
      return value;
    case "hora":
    case "horas":
      return value / 24;
    case "mes":
    case "meses":
      return value * 30;
    default:
      return null;
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
          fetch(
            "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getcategorias" }),
            },
          ),
          fetch(
            "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getCursos" }),
            },
          ),
        ]);

        const categoriesData = await catRes.json();
        const coursesData = await cursRes.json();

        const categoryMap = categoriesData.categorias.reduce((map, cat) => {
          map[cat.id] = cat.nombre;
          return map;
        }, {});

        const allCursos = (coursesData.cursos.cursos || []).filter((curso) => {
          const isPublished = curso.estado === "Publicado";
          const durationInDays = parseDurationToDays(curso.duracion_estimada);
          return isPublished && durationInDays !== null && durationInDays <= 30;
        });

        const coursesWithExtraData = await Promise.all(
          allCursos.map(async (curso) => {
            try {
              const instRes = await fetch(
                `https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php?id=${curso.profesor_id}`,
              );
              const instData = await instRes.json();
              const instructorName =
                instData.status === "success"
                  ? `${instData.usuario.nombre} ${instData.usuario.apellido}`.trim()
                  : "Instructor Academia";

              const valRes = await fetch(
                `https://apiacademy.hitpoly.com/ajax/valoracionesController.php?accion=getResumen&curso_id=${curso.id}`,
              );
              const valData = await valRes.json();

              return {
                ...curso,
                instructorName,
                rating: valData.status === "success" ? valData.rating : 0,
                reviews: valData.status === "success" ? valData.reviews : 0,
              };
            } catch (err) {
              return {
                ...curso,
                instructorName: "Instructor Academia",
                rating: 0,
                reviews: 0,
              };
            }
          }),
        );

        const organized = coursesWithExtraData.reduce((acc, curso) => {
          const catName = categoryMap[curso.categoria_id] || "Otros";
          if (!acc[catName]) acc[catName] = [];
          acc[catName].push({
            id: curso.id,
            title: curso.titulo,
            subtitle: curso.subtitulo,
            banner: curso.portada_targeta,
            videoUrl: curso.url_video_introductorio,
            instructorName: curso.instructorName,
            price: `${curso.precio} ${curso.moneda}`,
            rating: curso.rating,
            reviews: curso.reviews,
            accessLink: `/curso/${curso.id}`,
          });
          return acc;
        }, {});

        setCoursesByCategory(organized);
        if (Object.keys(organized).length > 0)
          setActiveCategoryName(Object.keys(organized)[0]);
      } catch (err) {
        setError("Error al cargar cursos cortos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentCourses = useMemo(
    () => coursesByCategory[activeCategoryName] || [],
    [activeCategoryName, coursesByCategory],
  );

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Typography variant="h3" pb={4} pt={3}>
        Los mejores cursos de un mes o menos
      </Typography>

      {/* CONTENEDOR PRINCIPAL CON BORDE REDONDEADO */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        {/* PESTAÑAS (ESTILO IMAGEN 1: FONDO MORADO) */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            borderBottom: "1px solid #ddd",
            overflowX: "auto",
          }}
        >
          {Object.keys(coursesByCategory).map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategoryName(category)}
              sx={{
                flex: 1,
                minWidth: "fit-content",
                py: 2,
                borderRadius: 0,
                textTransform: "none",
                fontWeight: "bold",
                // Fondo morado si está activo, transparente si no
                bgcolor:
                  activeCategoryName === category ? "#6F4CE0" : "transparent",
                // Texto blanco si está activo, morado si no
                color: activeCategoryName === category ? "#fff" : "#6F4CE0",
                "&:hover": {
                  bgcolor:
                    activeCategoryName === category ? "#5a3ecc" : "#f8f9fa",
                },
              }}
            >
              {category}
            </Button>
          ))}
        </Box>

        {/* CONTENEDOR DE SCROLL HORIZONTAL CON GAP RESPONSIVO */}
<Box
  sx={{
    display: "flex",
    overflowX: "auto",
    // AJUSTE AQUÍ: gap 5 (40px) en móviles, gap 3 (24px) en pantallas sm en adelante
    gap: { xs: 5, sm: 3 }, 
    p: 3,
    scrollPaddingLeft: "24px",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
    "&::-webkit-scrollbar": { height: "6px" },
    "&::-webkit-scrollbar-thumb": {
      bgcolor: "#ccc",
      borderRadius: "10px",
    },
    margin: 0,
    width: "100%",
  }}
>
  {loading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        py: 5,
      }}
    >
      <CircularProgress sx={{ color: "#6F4CE0" }} />
    </Box>
  ) : currentCourses.length > 0 ? (
    currentCourses.map((course) => (
      <Box
        key={course.id}
        sx={{
          flex: "0 0 auto",
          // Mantenemos tus anchos configurados
          width: { xs: "280px", sm: "300px", md: "320px" },
          scrollSnapAlign: "start",
        }}
      >
        <CursoCard {...course} />
      </Box>
    ))
  ) : (
    <Typography sx={{ p: 4 }}>
      No hay cursos cortos en esta categoría.
    </Typography>
  )}
</Box>
      </Box>
    </Box>
  );
};

export default SectionTwo;
