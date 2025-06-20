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

  useEffect(() => {
    const fetchCourseAndContentData = async () => {
      if (!courseIdFromUrl) {
        setError("ID del curso no proporcionado en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Obtener datos del curso (primero, para asegurarnos de que el curso exista)
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
        // **DEBUGGING:** Imprime la estructura completa de courseData para verificar
        console.log("Datos de la API de cursos recibidos (courseData):", courseData);

        let foundCourse = null;

        // **CORRECCIÓN CLAVE AQUÍ:** Accede a `courseData.cursos.cursos`
        if (courseData.status === "success" && courseData.cursos && Array.isArray(courseData.cursos.cursos)) {
          foundCourse = courseData.cursos.cursos.find( // Cambiado a courseData.cursos.cursos
            (curso) => String(curso.id) === String(courseIdFromUrl)
          );

          if (foundCourse) {
            setApiData(foundCourse);
            console.log("Datos del curso encontrados (foundCourse):", foundCourse);
          } else {
            setError(`Curso con ID ${courseIdFromUrl} no encontrado en la lista de cursos.`);
            setLoading(false);
            return; // Detener la ejecución si el curso no se encuentra
          }
        } else {
          setError(courseData.message || "Error al obtener datos de los cursos: Formato inesperado o la propiedad 'cursos' no es un array anidado.");
          setLoading(false);
          return; // Detener la ejecución si hay un error en los datos de los cursos
        }

        // 2. Obtener módulos específicos del curso usando la nueva API
        const modulesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php", // ¡Nueva API!
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getModulosCurso", id: courseIdFromUrl }), // ¡Pasando el ID del curso!
          }
        );

        if (!modulesResponse.ok) {
          const errorText = await modulesResponse.text();
          throw new Error(`Error HTTP al obtener módulos por curso: ${modulesResponse.status}, mensaje: ${errorText}`);
        }

        const modulesData = await modulesResponse.json();

        if (modulesData.status === "success" && Array.isArray(modulesData.modulos)) {
          setCourseModules(modulesData.modulos); // Ya vienen filtrados por el backend
        } else {
          // Si no hay módulos o el formato es incorrecto, establecer a un array vacío
          setCourseModules([]);
          console.warn("No se encontraron módulos para el curso o formato inesperado:", modulesData.message);
        }

        // 3. Obtener todas las clases (esta API no tiene filtrado por curso, se mantiene igual por ahora)
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
        if (classesData.status === "success" && Array.isArray(classesData.clases)) {
          // Filtrar las clases por los módulos obtenidos, que ya están filtrados por curso
          const relevantModuleIds = new Set(modulesData.modulos.map(m => String(m.id)));
          const filteredClasses = classesData.clases.filter(clase =>
            relevantModuleIds.has(String(clase.modulo_id))
          );
          setCourseClasses(filteredClasses);
        } else {
          setCourseClasses([]);
          console.warn("No se encontraron clases o formato inesperado:", classesData.message);
        }

      } catch (err) {
        setError("No se pudo conectar con el servidor o hubo un error al obtener los datos. Por favor, inténtalo de nuevo más tarde.");
        console.error("Error general en fetchCourseAndContentData:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseIdFromUrl) {
      fetchCourseAndContentData();
    }
  }, [courseIdFromUrl]);

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
    profesor_id, // Puede ser undefined si no viene del API
    nivel = "N/A",
    precio = "N/A", // Asegúrate que el API devuelve un formato adecuado para el precio
    url_video_introductorio, // Puede ser undefined
    marcaAsociada = [], // Asegúrate que el API devuelve un array o vacío
    url_banner, // Puede ser undefined
    resultados_aprendizaje = [], // Asegúrate que el API devuelve un array o vacío
    callToActionData, // Si viene del API directamente
  } = apiData;

  const classesByModule = courseClasses.reduce((acc, clase) => {
    // Asegurarse de que modulo_id exista y sea un valor válido
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
    activationDate: "N/A", // Este campo parece ser fijo
    learningPace: ritmo_aprendizaje,
    classType: tipo_clase,
    credentialTitle: titulo_credencial,
    credentialDescription: descripcion_credencial,
    instructorData: {
      name: profesor_id ? `Profesor ID: ${profesor_id}` : "Instructor por determinar",
      avatar: "/images/default-avatar.png", // Asegúrate que esta ruta sea válida
      description: "Experto en el área.", // Puedes obtener esto del API si está disponible
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