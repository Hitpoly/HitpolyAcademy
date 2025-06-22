import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import ProgrammeDetailsBanner from "../banners/infoCurso";
import EnrollmentForm from "../forms/EnrollmentForm";
import FactsAndCertificate from "./components/baner/FactsAndCertificate";
import Footer from "../footer/pieDePagina";
import CenteredCallToAction from "../banners/llamadoALaAccion";
import FaqSection from "./components/FaqSection";
import CourseDetailPage from "./components/CourseDetailPage";

function PaginaDeInformacion() {
  const [apiData, setApiData] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [courseClasses, setCourseClasses] = useState([]);
  const [professorDetails, setProfessorDetails] = useState(null);
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
          throw new Error(
            `Error HTTP al obtener datos de los cursos: ${courseResponse.status}, mensaje: ${errorText}`
          );
        }

        const courseData = await courseResponse.json();
        console.log(
          "PaginaDeInformacion: Datos completos de la API de cursos (courseData):",
          courseData
        );

        let foundCourse = null;

        if (
          courseData.status === "success" &&
          courseData.cursos &&
          Array.isArray(courseData.cursos.cursos)
        ) {
          foundCourse = courseData.cursos.cursos.find(
            (curso) => String(curso.id) === String(courseIdFromUrl)
          );

          if (foundCourse) {
            setApiData(foundCourse);

            if (foundCourse.profesor_id) {
              try {
                const professorResponse = await fetch(
                  "https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      accion: "getAlumnoProfesor",
                      id: foundCourse.profesor_id,
                    }),
                  }
                );

                if (!professorResponse.ok) {
                  const errorText = await professorResponse.text();
                  throw new Error(
                    `Error HTTP al obtener datos del profesor: ${professorResponse.status}, mensaje: ${errorText}`
                  );
                }

                const professorData = await professorResponse.json();
                console.log(
                  "PaginaDeInformacion: Datos del profesor:",
                  professorData
                );

                if (
                  professorData.status === "success" &&
                  professorData.usuario
                ) {
                  setProfessorDetails(professorData.usuario);
                } else {
                  console.warn(
                    "PaginaDeInformacion: No se encontraron detalles del profesor o formato inesperado. Mensaje:",
                    professorData.message
                  );
                  setProfessorDetails(null);
                }
              } catch (profError) {
                console.error(
                  "PaginaDeInformacion: Error al obtener datos del profesor:",
                  profError
                );
                setProfessorDetails(null);
              }
            } else {
              setProfessorDetails(null);
            }
          } else {
            setError(
              `Curso con ID ${courseIdFromUrl} no encontrado en la lista de cursos.`
            );
            setLoading(false);
            return;
          }
        } else {
          setError(
            courseData.message ||
              "Error al obtener datos de los cursos: Formato inesperado o la propiedad 'cursos' no es un array anidado."
          );
          setLoading(false);
          return;
        }

        const modulesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accion: "getModulosCurso",
              id: courseIdFromUrl,
            }),
          }
        );

        if (!modulesResponse.ok) {
          const errorText = await modulesResponse.text();
          throw new Error(
            `Error HTTP al obtener módulos por curso: ${modulesResponse.status}, mensaje: ${errorText}`
          );
        }

        const modulesData = await modulesResponse.json();
        console.log(
          "PaginaDeInformacion: Datos de módulos por curso (modulesData):",
          modulesData
        );

        let fetchedModules = [];

        if (
          modulesData.status === "success" &&
          Array.isArray(modulesData.modulos)
        ) {
          fetchedModules = modulesData.modulos;
          setCourseModules(fetchedModules);
        } else {
          console.warn(
            "PaginaDeInformacion: No se encontraron módulos para el curso o formato inesperado. Mensaje:",
            modulesData.message
          );
          setCourseModules([]);
        }

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
          throw new Error(
            `Error HTTP al obtener clases: ${classesResponse.status}, mensaje: ${errorText}`
          );
        }

        const classesData = await classesResponse.json();
        console.log(
          "PaginaDeInformacion: Datos de todas las clases (classesData):",
          classesData
        );

        if (
          classesData.status === "success" &&
          Array.isArray(classesData.clases)
        ) {
          const relevantModuleIds = new Set(
            fetchedModules.map((m) => String(m.id))
          );
          const filteredClasses = classesData.clases.filter((clase) =>
            relevantModuleIds.has(String(clase.modulo_id))
          );
          setCourseClasses(filteredClasses);
          console.log(
            "PaginaDeInformacion: Clases filtradas para este curso:",
            filteredClasses
          );
        } else {
          console.warn(
            "PaginaDeInformacion: No se encontraron clases o formato inesperado. Mensaje:",
            classesData.message
          );
          setCourseClasses([]);
        }
      } catch (err) {
        console.error(
          "PaginaDeInformacion: Error general en fetchCourseAndContentData:",
          err
        );
        setError(
          "No se pudo conectar con el servidor o hubo un error al obtener los datos. Por favor, inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseIdFromUrl) {
      fetchCourseAndContentData();
    }
  }, [courseIdFromUrl]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando información del curso...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!apiData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert severity="warning">
          No se pudo cargar la información del curso. Esto puede ocurrir si el
          ID no es válido o si el curso no existe.
        </Alert>
      </Box>
    );
  }

  // Desestructuración y asignación de valores predeterminados
  const {
    titulo = "Título no disponible",
    descripcion_larga = "Descripción no disponible",
    descripcion_corta = "Descripción no disponible",
    duracion_estimada = "Duración no disponible",
    subtitulo,
    horas_por_semana, // Mantener el original aquí para la lógica de abajo
    fecha_inicio_clases = "Próximamente",
    fecha_limite_inscripcion = "Abiertas",
    ritmo_aprendizaje = "Flexible",
    tipo_clase = "Online",
    titulo_credencial = "Certificado",
    descripcion_credencial = "Otorgado al completar",
    profesor_id,
    nivel = "N/A",
    precio = "N/A",
    moneda = "USD", // Asegúrate de tener un valor por defecto para moneda
    url_video_introductorio,
    marcaAsociada = [],
    url_banner,
    // eslint-disable-next-line no-unused-vars
    resultados_aprendizaje = [],
    callToActionData,
    temario,
  } = apiData;

  // Prepara el temario para pasarlo a `CourseDetailPage`
  const temarioForDisplay =
    temario && Array.isArray(temario)
      ? temario.map((item) => item.titulo || "Tema sin título")
      : [];

  const classesByModule = courseClasses.reduce((acc, clase) => {
    const moduleId = String(clase.modulo_id);
    if (moduleId && moduleId !== "undefined" && moduleId !== "null") {
      if (!acc[moduleId]) {
        acc[moduleId] = [];
      }
      acc[moduleId].push(clase.titulo || "Clase sin título");
    }
    return acc;
  }, {});

  const modulesWithClasses = courseModules.map((module) => {
    const moduleId = String(module.id);
    const moduleClasses = classesByModule[moduleId] || [];
    return {
      title: module.titulo || "Módulo sin título",
      id: moduleId,
      topics: moduleClasses,
    };
  });

  const instructorName = professorDetails
    ? `${professorDetails.nombre || ""} ${
        professorDetails.apellido || ""
      }`.trim() || "Instructor no especificado"
    : "Instructor no especificado";

  const instructorBio = professorDetails?.biografia || "Experto en el área.";
  const instructorAvatar =
    professorDetails?.url_foto_perfil || "/images/default-avatar.png";

  const courseDataForDetailPage = {
    title: titulo,
    description: descripcion_larga,
    instructor: instructorName,
    duration: duracion_estimada,
    level: nivel,
    price: precio,
    inductionVideoUrl: url_video_introductorio,
    modules: modulesWithClasses,
    learningOutcomes: temarioForDisplay,
  };

  const countdownTarget =
    fecha_limite_inscripcion && fecha_limite_inscripcion !== "Abiertas"
      ? `${fecha_limite_inscripcion}T23:59:59`
      : null;

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
      name: instructorName,
      avatar: instructorAvatar,
      description: instructorBio,
    },
    brandingData: marcaAsociada,
  };

  // Prepara el valor de horas_por_semana para mostrar, si el de la API es null
  const displayHorasPorSemana = horas_por_semana !== null ? horas_por_semana : "No especificado";

  // Formatea las fechas para una mejor visualización si no son los valores por defecto
  const formattedFechaInicio = fecha_inicio_clases !== "Próximamente" 
    ? new Date(fecha_inicio_clases).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : fecha_inicio_clases;

  const formattedFechaInscripcion = fecha_limite_inscripcion !== "Abiertas" 
    ? new Date(fecha_limite_inscripcion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : fecha_limite_inscripcion;


  const factsData = {
    title: "Datos Clave del Curso",
    items: [
      {
        value: duracion_estimada,
        description: "Duración estimada",
        source: "",
      },
      { value: displayHorasPorSemana, description: "Horas por semana", source: "" }, // Usamos el valor formateado
      { value: nivel, description: "Nivel del curso", source: "" },
      {
        value: ritmo_aprendizaje,
        description: "Ritmo de aprendizaje",
        source: "",
      },
      { value: tipo_clase, description: "Tipo de clase", source: "" },
      { 
        value: `${precio} ${moneda}`, 
        description: "Precio", 
        source: "" 
      },
      { 
        value: formattedFechaInicio, 
        description: "Inicio de clases", 
        source: "" 
      },
      { 
        value: formattedFechaInscripcion, 
        description: "Cierre de inscripciones", 
        source: "" 
      },
    ],
  };

  return (
    <>
      <Box
        sx={{
          height: { xs: "100%", md: "100%" },
          backgroundImage: `url(${url_banner || "images/fondoCursos.jpg"})`,
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
        certificateSubtitle={subtitulo}
        certificateLongDescription={descripcion_larga}
        facts={factsData}
        brandingData={programmeDetailsForBanner.brandingData}
      />

      {/* FaqSection */}
      <Box sx={{ padding: { xs: "20px", md: "0px 170px" } }}>
        <FaqSection
          faqs={[]} // Si la API tiene datos de FAQs, pásalos aquí.
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