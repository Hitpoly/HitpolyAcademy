import { useState, useEffect } from "react";

const baseUrl = "https://apiacademy.hitpoly.com/";

export const useCourseData = (courseId) => {
  const [modules, setModules] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        setError("No se proporcionó un ID de curso.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Cargar Módulos y Clases
        const modulesResponse = await fetch(`${baseUrl}ajax/getModulosPorCursoController.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getModulosCurso", id: courseId }),
        });
        const modulesData = await modulesResponse.json();

        if (modulesData.status === "success" && Array.isArray(modulesData.modulos)) {
          const sortedModules = modulesData.modulos.sort((a, b) => a.orden - b.orden);
          const modulesWithClasses = await Promise.all(
            sortedModules.map(async (module) => {
              const classResponse = await fetch(`${baseUrl}ajax/traerTodasClasesController.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "getClases", id: module.id }),
              });
              const classData = await classResponse.json();
              const filteredClasses = (classData.clases || [])
                .filter((clase) => String(clase.modulo_id) === String(module.id))
                .map((clase) => ({
                  id: parseInt(clase.id, 10),
                  title: clase.titulo,
                  videoUrl: clase.url_video,
                  orden: clase.orden,
                  description: clase.descripcion || null,
                }))
                .sort((a, b) => a.orden - b.orden);

              return { id: module.id, title: module.titulo, classes: filteredClasses };
            })
          );
          setModules(modulesWithClasses);
        }

        // Cargar Recursos
        const resResponse = await fetch(`${baseUrl}ajax/getAllRecursosController.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getRecursos" }),
        });
        const resData = await resResponse.json();
        setAllResources((resData.recursos || []).map(r => ({
          ...r,
          fullUrl: r.url.startsWith("http") ? r.url : baseUrl + r.url
        })));

      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  return { modules, allResources, loading, error };
};