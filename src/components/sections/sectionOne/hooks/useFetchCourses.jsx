import { useState, useEffect } from "react";

export const useFetchCourses = () => {
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const [catRes, cursRes] = await Promise.all([
          fetch(
            "https://apiacademy.hitpoly.com/ajax/GetCategoriasController.php",
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

        const allCursos = (coursesData.cursos || []).filter(
          (c) => c.estado === "Publicado",
        );

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

          // LOG 3: Verificar el mapeo final


          acc[catName].push({
            id: curso.id,
            title: curso.titulo,
            subtitle: curso.subtitulo,
            banner: curso.portada_targeta,
            videoUrl: curso.url_video_introductorio, // 👈 Aquí debe estar el enlace
            instructorName: curso.instructorName,
            price: `${curso.precio} ${curso.moneda}`,
            rating: curso.rating,
            reviews: curso.reviews,
            accessLink: `/curso/${curso.id}`,
            oferta: curso.oferta,
            students: curso.total_estudiantes || 0
          });
          return acc;
        }, {});


        setCoursesByCategory(organized);
      } catch (err) {

        setError("Error al cargar los cursos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { coursesByCategory, loading, error };
};