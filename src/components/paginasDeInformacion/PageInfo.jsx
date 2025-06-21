import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useParams } from 'react-router-dom';

import ProgrammeDetailsBanner from "../banners/infoCurso";
import EnrollmentForm from "../forms/EnrollmentForm";
import FactsAndCertificate from "./components/baner/FactsAndCertificate";
import Footer from "../footer/pieDePagina";
import CenteredCallToAction from "../banners/llamadoALaAccion";
import FaqSection from "./components/FaqSection";
import CourseDetailPage from './components/CourseDetailPage';

function PaginaDeInformacion() {
  const [apiData, setApiData] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [courseClasses, setCourseClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id: courseIdFromUrl } = useParams();

  // console.log para depuración, puedes eliminarlos después de confirmar la solución
  // console.log("-----------------------------------------");
  // console.log("Renderizando PaginaDeInformacion...");
  // console.log("Estado actual - courseIdFromUrl:", courseIdFromUrl);
  // console.log("Estado actual - apiData:", apiData ? apiData.titulo : "Cargando/No disponible");
  // console.log("Estado actual - courseModules (antes de useEffect):", courseModules);
  // console.log("Estado actual - loading:", loading);
  // console.log("Estado actual - error:", error);
  // console.log("-----------------------------------------");


  useEffect(() => {
    // console.log(">>> useEffect DISPARADO <<<");
    // console.log("Dependencies:", { courseIdFromUrl, courseModules }); // Si dejas este, verás que courseModules no cambia después del primer set


    const fetchCourseAndContentData = async () => {
      if (!courseIdFromUrl) {
        setError("ID del curso no proporcionado en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null); // Limpiar errores previos

      try {
        // 1. Obtener datos del curso
        const courseResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getCursos" }),
          }
        );

        if (!courseResponse.ok) {
          const errorText = await courseResponse.text();
          throw new Error(`Error HTTP al obtener datos de los cursos: ${courseResponse.status}, mensaje: ${errorText}`);
        }

        const courseData = await courseResponse.json();
        // console.log("API CALL 1: Datos de la API de cursos recibidos (courseData):", courseData);
        // console.log("API CALL 1: Estructura de courseData.cursos:", courseData.cursos);


        let foundCourse = null;

        if (courseData.status === "success" && courseData.cursos && Array.isArray(courseData.cursos.cursos)) {
          foundCourse = courseData.cursos.cursos.find(
            (curso) => String(curso.id) === String(courseIdFromUrl)
          );

          if (foundCourse) {
            setApiData(foundCourse);
            // console.log("Curso encontrado (foundCourse):", foundCourse);
          } else {
            setError(`Curso con ID ${courseIdFromUrl} no encontrado en la lista de cursos.`);
            setLoading(false);
            return;
          }
        } else {
          setError(courseData.message || "Error al obtener datos de los cursos: Formato inesperado o la propiedad 'cursos' no es un array anidado.");
          setLoading(false);
          return;
        }

        // 2. Obtener módulos específicos del curso
        const modulesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getModulosCurso", id: courseIdFromUrl }),
          }
        );

        if (!modulesResponse.ok) {
          const errorText = await modulesResponse.text();
          throw new Error(`Error HTTP al obtener módulos por curso: ${modulesResponse.status}, mensaje: ${errorText}`);
        }

        const modulesData = await modulesResponse.json();
        // console.log("API CALL 2: Datos de la API de módulos recibidos (modulesData):", modulesData);
        // console.log("API CALL 2: Contenido de modulesData.modulos:", modulesData.modulos);

        let fetchedModules = [];

        if (modulesData.status === "success" && Array.isArray(modulesData.modulos)) {
          fetchedModules = modulesData.modulos;
          setCourseModules(fetchedModules);
          // console.log("Módulos establecidos:", fetchedModules);
        } else {
          // Si no hay módulos o el formato es incorrecto, establecer a un array vacío
          // console.warn("No se encontraron módulos para el curso o formato inesperado:", modulesData.message || "La propiedad 'modulos' no es un array. Estableciendo modules a []");
          setCourseModules([]); // Esto se llamará solo una vez por courseIdFromUrl ahora.
        }

        // 3. Obtener todas las clases
        const classesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerTodasClasesController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getClases" }),
          }
        );

        if (!classesResponse.ok) {
          const errorText = await classesResponse.text();
          throw new Error(`Error HTTP al obtener clases: ${classesResponse.status}, mensaje: ${errorText}`);
        }

        const classesData = await classesResponse.json();
        // console.log("API CALL 3: Datos de la API de clases recibidos (classesData):", classesData);
        // console.log("API CALL 3: Contenido de classesData.clases:", classesData.clases);


        if (classesData.status === "success" && Array.isArray(classesData.clases)) {
          const relevantModuleIds = new Set(fetchedModules.map(m => String(m.id)));
          const filteredClasses = classesData.clases.filter(clase =>
            relevantModuleIds.has(String(clase.modulo_id))
          );
          setCourseClasses(filteredClasses);
          // console.log("Clases filtradas:", filteredClasses);
        } else {
          setCourseClasses([]);
          // console.warn("No se encontraron clases o formato inesperado:", classesData.message || "La propiedad 'clases' no es un array. Estableciendo classes a []");
        }

      } catch (err) {
        console.error("Error general en fetchCourseAndContentData:", err);
        setError("No se pudo conectar con el servidor o hubo un error al obtener los datos. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (courseIdFromUrl) {
      fetchCourseAndContentData();
    }
  }, [courseIdFromUrl]); // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN! SOLO courseIdFromUrl

  // Renderizado Condicional: Loading, Error, No Data
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando información del curso...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!apiData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Alert severity="warning">No se pudo cargar la información del curso. Esto puede ocurrir si el ID no es válido o si el curso no existe.</Alert>
      </Box>
    );
  }

  // Desestructuración y asignación de valores predeterminados para evitar `undefined`
  const {
    titulo = "Título no disponible",
    descripcion_larga = "Descripción no disponible",
    descripcion_corta = "Descripción no disponible",
    duracion_estimada = "Duración no disponible",
    horas_por_semana = "N/A",
    fecha_inicio_clases = "Próximamente",
    fecha_limite_inscripcion = "Abiertas",
    ritmo_aprendizaje = "Flexible",
    tipo_clase = "Online",
    titulo_credencial = "Certificado",
    descripcion_credencial = "Otorgado al completar",
    profesor_id,
    nivel = "N/A",
    precio = "N/A",
    url_video_introductorio,
    marcaAsociada = [],
    url_banner,
    resultados_aprendizaje = [],
    callToActionData,
  } = apiData;

  const classesByModule = courseClasses.reduce((acc, clase) => {
    const moduleId = String(clase.modulo_id);
    if (moduleId && moduleId !== 'undefined' && moduleId !== 'null') {
      if (!acc[moduleId]) {
        acc[moduleId] = [];
      }
      acc[moduleId].push(clase.titulo || "Clase sin título");
    }
    return acc;
  }, {});

  const modulesWithClasses = courseModules.map(module => {
    const moduleId = String(module.id);
    const moduleClasses = classesByModule[moduleId] || [];
    return {
      title: module.titulo || "Módulo sin título",
      id: moduleId,
      topics: moduleClasses,
    };
  });

  const courseDataForDetailPage = {
    title: titulo,
    description: descripcion_larga,
    instructor: profesor_id ? `Profesor ID: ${profesor_id}` : "Instructor no especificado",
    duration: duracion_estimada,
    level: nivel,
    price: precio,
    inductionVideoUrl: url_video_introductorio,
    modules: modulesWithClasses,
    learningOutcomes: resultados_aprendizaje,
  };

  const countdownTarget = "2025-06-29T23:59:59";

  const programmeDetailsForBanner = {
    programmeName: titulo,
    description: descripcion_corta,
    duration: duracion_estimada,
    hoursPerWeek: horas_por_semana,
    startDate: fecha_inicio_clases,
    enrollmentDeadline: fecha_limite_inscripcion,
    activationDate: "N/A",
    learningPace: ritmo_aprendizaje,
    classType: tipo_clase,
    credentialTitle: titulo_credencial,
    credentialDescription: descripcion_credencial,
    instructorData: {
      name: profesor_id ? `Profesor ID: ${profesor_id}` : "Instructor por determinar",
      avatar: "/images/default-avatar.png",
      description: "Experto en el área.",
    },
    brandingData: marcaAsociada,
  };

  const certificateData = {
    title: titulo_credencial,
    paragraphs: [descripcion_credencial],
    note: "Este certificado es reconocido por las marcas asociadas (si aplica).",
  };

  const factsData = {
    title: "Datos Clave del Curso",
    items: [
      { value: duracion_estimada, description: "Duración estimada", source: "" },
      { value: horas_por_semana, description: "Horas por semana", source: "" },
      { value: nivel, description: "Nivel del curso", source: "" },
      { value: ritmo_aprendizaje, description: "Ritmo de aprendizaje", source: "" },
      { value: tipo_clase, description: "Tipo de clase", source: "" },
    ],
  };

  return (
    <>
      <Box
        sx={{
          height: { xs: "100%", md: "100%" },
          backgroundImage: `url(${url_banner || 'images/fondoCursos.jpg'})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          padding: { xs: "20px", md: "80px 150px" },
          display: "flex",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            backgroundColor: "#FFFFFF",
            borderRadius: "25px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            gap: 10,
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "65%" } }}>
            <ProgrammeDetailsBanner {...programmeDetailsForBanner} />
          </Box>
          <Box
            sx={{
              width: { xs: "100%", md: "35%" },
              backgroundColor: "#f4f4f4",
              borderRadius: {
                xs: "0px 0px 25px 25px",
                md: "0px 25px 25px 0px",
              },
            }}
          >
            <EnrollmentForm />
          </Box>
        </Box>
      </Box>

      {/* CourseDetailPage */}
      {apiData && (
        <CourseDetailPage
          course={courseDataForDetailPage}
          countdownTargetDate={countdownTarget}
        />
      )}

      {/* FactsAndCertificate */}
      <FactsAndCertificate
        certificate={certificateData}
        facts={factsData}
        brandingData={programmeDetailsForBanner.brandingData}
      />

      {/* FaqSection */}
      <Box sx={{ padding: { xs: "20px", md: "0px 170px" } }}>
        <FaqSection
          faqs={[]} // Revisa si tienes FAQs en tu API para pasarlas aquí
          initialVisibleCount={3}
          sectionTitle="Preguntas Frecuentes sobre el Curso"
        />
      </Box>

      {/* CenteredCallToAction */}
      {callToActionData ? <CenteredCallToAction {...callToActionData} /> : null}

      {/* Footer */}
      <Footer />
    </>
  );
}

export default PaginaDeInformacion;