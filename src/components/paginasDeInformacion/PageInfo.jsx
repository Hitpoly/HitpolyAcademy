import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LoadingView, ErrorView, NotFoundView } from "./StatusViews";
import InformacionView from "./InformacionView";

const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  return /^\d+$/.test(id) ? id : null;
};

const fetchSafeJson = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Respuesta del servidor no válida");
  }
};

function PaginaDeInformacion() {
  const [apiData, setApiData] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [courseClasses, setCourseClasses] = useState([]);
  const [professorDetails, setProfessorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id: courseSlugFromUrl } = useParams();
  const numericCourseId = extractIdFromSlug(courseSlugFromUrl);

  useEffect(() => {
    const fetchCourseAndContentData = async () => {
      if (!numericCourseId) {
        setError("ID de curso no válido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const courseData = await fetchSafeJson(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          { accion: "getCursos" }
        );

        const foundCourse = courseData?.cursos?.find(
          (c) => String(c.id) === numericCourseId
        );

        if (!foundCourse) throw new Error("El curso solicitado no existe.");
        
        setApiData(foundCourse);

        const [profRes, modRes, classRes] = await Promise.all([
          foundCourse.profesor_id
            ? fetchSafeJson(
                "https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php",
                { accion: "getAlumnoProfesor", id: foundCourse.profesor_id }
              )
            : Promise.resolve(null),

          fetchSafeJson(
            "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php",
            { accion: "getModulosCurso", id: numericCourseId }
          ).catch(() => ({ modulos: [] })),

          fetchSafeJson(
            "https://apiacademy.hitpoly.com/ajax/traerTodasClasesController.php",
            { accion: "getClases" }
          ).catch(() => ({ clases: [] })),
        ]);

        if (profRes && profRes.status === "success") {
          setProfessorDetails(profRes.usuario);
        }

        setCourseModules(modRes?.modulos || []);
        setCourseClasses(classRes?.clases || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndContentData();
  }, [numericCourseId]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;
  if (!apiData) return <NotFoundView />;

  const instructorName = professorDetails
    ? `${professorDetails.nombre} ${professorDetails.apellido}`
    : "Instructor no especificado";

  const programmeDetails = {
    programmeName: apiData.titulo,
    description: apiData.descripcion_corta,
    duration: apiData.duracion_estimada,
    hoursPerWeek: apiData.hours_por_semana,
    startDate: apiData.fecha_inicio_clases,
    enrollmentDeadline: apiData.fecha_limite_inscripcion,
    learningPace: apiData.ritmo_aprendizaje,
    classType: apiData.tipo_clase,
    credentialTitle: apiData.titulo_credencial,
    credentialDescription: apiData.descripcion_credencial,
    instructorData: {
      name: instructorName,
      avatar: professorDetails?.avatar || "", 
      description: professorDetails?.biografia || "Experto en habilidades digitales.",
    },
    brandingData: apiData.marcaAsociada || [],
    price: apiData.precio,
    oferta: apiData.oferta,
    currency: apiData.moneda || "$",
    studentsCount: apiData.total_estudiantes || 0,
  };

  const modulesWithClasses = courseModules.map((module) => ({
    title: module.titulo,
    id: String(module.id),
    topics: courseClasses
      .filter((c) => String(c.modulo_id) === String(module.id))
      .map((c) => c.titulo),
  }));

  let precioString = `${apiData.precio} ${apiData.moneda}`;
  if (apiData.oferta && apiData.precio) {
    const originalPrice = parseFloat(apiData.precio);
    if (!isNaN(originalPrice)) {
      if (apiData.oferta.precio_oferta && parseFloat(apiData.oferta.precio_oferta) > 0) {
        precioString = `${apiData.oferta.precio_oferta} ${apiData.moneda} (OFERTA)`;
      } else if (apiData.oferta.descuento && parseFloat(apiData.oferta.descuento) > 0) {
        const newPrice = originalPrice - (originalPrice * (apiData.oferta.descuento / 100));
        precioString = `${newPrice.toFixed(2)} ${apiData.moneda} (-${apiData.oferta.descuento}%)`;
      }
    }
  }

  const factsData = {
    title: "Datos Clave del Curso",
    items: [
      { value: apiData.duracion_estimada, description: "Duración estimada" },
      { value: apiData.horas_por_semana || "Flexible", description: "Horas por semana" },
      { value: apiData.nivel || "Todos los niveles", description: "Nivel del curso" },
      { value: apiData.ritmo_aprendizaje, description: "Ritmo de aprendizaje" },
      { value: apiData.tipo_clase, description: "Tipo de clase" },
      { value: precioString, description: "Precio" },
      { value: apiData.fecha_inicio_clases, description: "Inicio de clases" }, 
      { value: apiData.fecha_limite_inscripcion, description: "Cierre de inscripciones" }, 
    ],
  };

  return (
    <InformacionView
      apiData={apiData}
      instructorName={instructorName}
      modulesWithClasses={modulesWithClasses}
      programmeDetails={programmeDetails}
      factsData={factsData}
      numericCourseId={numericCourseId}
    />
  );
}

export default PaginaDeInformacion;