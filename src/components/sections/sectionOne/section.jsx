import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import CursoCard from "../../../components/cards/CursoCard";

const SectionCardGrid = () => {
  const navigate = useNavigate();
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("--- INICIANDO CARGA DE DATOS ---");

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

        const allCursos = (coursesData.cursos.cursos || []).filter(
          (c) => c.estado === "Publicado",
        );
        const uniqueProfIds = [...new Set(allCursos.map((c) => c.profesor_id))];

        // ACTUALIZACIÓN: Petición al nuevo PHP usando GET para obtener el mensaje y datos
        const instructorPromises = uniqueProfIds.map(async (id) => {
          try {
            const res = await fetch(
              `https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php?id=${id}`
            );
            const data = await res.json();

            if (data.status === "success" && data.usuario) {
              // Imprimimos el mensaje que viene desde PHP
              console.log(`Respuesta para ID ${id}: ${data.message}`);
              
              return {
                id,
                name: `${data.usuario.nombre} ${data.usuario.apellido}`.trim(),
                avatar: data.usuario.avatar
              };
            }
            return { id, name: "Instructor Academia" };
          } catch (err) {
            console.error("Error al conectar con el controlador de profesor:", err);
            return { id, name: "Instructor Academia" };
          }
        });

        const instructors = await Promise.all(instructorPromises);
        const instMap = instructors.reduce(
          (m, i) => ({ ...m, [i.id]: i.name }),
          {},
        );

        const organized = allCursos.reduce((acc, curso) => {
          const catName = categoryMap[curso.categoria_id] || "Otros";
          if (!acc[catName]) acc[catName] = [];

          const instructorFinal = instMap[curso.profesor_id];

          acc[catName].push({
            id: curso.id,
            title: curso.titulo,
            banner: curso.portada_targeta,
            accessLink: `/curso/${curso.id}`,
            instructorName: instructorFinal || "Instructor Academia", // Aquí se asigna el nombre real
            rating: curso.valoracion || 0,
            price: `${curso.precio} ${curso.moneda}`,
            reviews: 120,
          });
          return acc;
        }, {});

        setCoursesByCategory(organized);
        if (Object.keys(organized).length > 0)
          setActiveCategoryName(Object.keys(organized)[0]);
      } catch (err) {
        console.error("Error general en fetchData:", err);
        setError("Error de carga");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentCourses = useMemo(() => {
    return coursesByCategory[activeCategoryName] || [];
  }, [activeCategoryName, coursesByCategory]);

  const handleShare = (platform, course) => {
  const shareUrl = `https://hitpoly.com/curso/${course.id}`; // URL de redirección
  const title = encodeURIComponent(course.title);
  const summary = encodeURIComponent(`¡Mira este curso en Hitpoly: ${course.title}!`);
  
  // No todas las redes sociales aceptan la imagen directamente por URL, 
  // esto depende mucho de los meta tags (OpenGraph) de hitpoly.com
  const image = encodeURIComponent(course.banner);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${title}%20${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    // Instagram no tiene API de share por URL, se suele copiar el link al portapapeles o usar Web Share API
  };

  if (platform === 'instagram') {
    navigator.clipboard.writeText(`${title} - ${shareUrl}`);
    alert("Enlace copiado al portapapeles. ¡Pégalo en tu Instagram!");
    return;
  }

  window.open(shareLinks[platform], '_blank', 'width=600,height=400');
};

  // Se mantiene el renderizado original con tus estilos
  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Typography variant="h3" pb={4} pt={3}>
        Las mejores habilidades en tendencia
      </Typography>

      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            borderBottom: "1px solid #ddd",
          }}
        >
          {Object.keys(coursesByCategory).map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategoryName(category)}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: 0,
                textTransform: "none",
                fontWeight: "bold",
                bgcolor:
                  activeCategoryName === category ? "#6F4CE0" : "transparent",
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
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#ccc",
              borderRadius: "10px",
            },
            "&::after": { content: '""', minWidth: "30px" },
          }}
        >
          {currentCourses.map((course) => (
            <Box
              key={course.id}
              sx={{
                flex: "0 0 auto",
                width: {
                  xs: "60%",
                  sm: "50%",
                  md: "28%",
                },
                scrollSnapAlign: "start",
              }}
            >
              <CursoCard {...course} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SectionCardGrid;