import React from "react";
import { Box } from "@mui/material";
import DynamicMeta from "../../utils/DynamicMeta";
import ProgrammeDetailsBanner from "../banners/infoCurso";
import EnrollmentForm from "../forms/cursoForm/EnrollmentForm";
import FactsAndCertificate from "./components/baner/FactsAndCertificate";
import Footer from "../footer/pieDePagina";
import CenteredCallToAction from "../banners/llamadoALaAccion";
import FaqSection from "./components/FaqSection";
import CourseDetailPage from "./components/CourseDetailPage";

function InformacionView({ 
  apiData, 
  instructorName, 
  modulesWithClasses, 
  programmeDetails, // Este ya viene procesado del padre
  factsData,        // Este ya viene procesado del padre
  numericCourseId 
}) {
  
  // 1. Re-calculamos datos específicos para CourseDetailPage
  const temarioForDisplay = apiData.temario && Array.isArray(apiData.temario)
    ? apiData.temario.map((item) => item.titulo || "Tema sin título")
    : [];

  const courseDataForDetailPage = {
    title: apiData.titulo,
    description: apiData.descripcion_larga,
    instructor: instructorName,
    duration: apiData.duracion_estimada,
    level: apiData.nivel,
    price: apiData.precio,
    inductionVideoUrl: apiData.url_video_introductorio,
    modules: modulesWithClasses,
    learningOutcomes: temarioForDisplay,
  };

  // 2. Formateo de fechas para el Countdown
  const countdownTarget = apiData.fecha_limite_inscripcion && apiData.fecha_limite_inscripcion !== "Abiertas"
    ? `${apiData.fecha_limite_inscripcion}T23:59:59`
    : null;

  // 3. Configuración completa del Call To Action
  const customCallToActionData = {
    title: `Regístrate en ${apiData.titulo}`,
    subtitle: "¡Asegura tu cupo hoy y transforma tu futuro profesional!",
    buttonText: "Inscríbete Ahora",
    buttonLink: "#enrollment-form",
    backgroundColor: "#E0E0E0",
    buttonColor: "primary",
    buttonSx: { backgroundColor: "#F21C63", "&:hover": { backgroundColor: "#d41857" } },
  };

  return (
    <>
      <DynamicMeta 
        title={`Curso de ${apiData.titulo} - Hitpoly Academy`} 
        description={apiData.descripcion_corta} 
        image={apiData.portada_targeta || ""} 
        url={window.location.href} 
      />

      {/* Hero Section / Banner Principal */}
      <Box
        sx={{
          backgroundImage: `url(${apiData.url_banner || "images/fondoCursos.jpg"})`,
          backgroundSize: "cover",
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
            gap: { xs: 2, md: 10 },
            width: "100%"
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "65%" } }}>
            <ProgrammeDetailsBanner {...programmeDetails} />
          </Box>
          <Box
            id="enrollment-form"
            sx={{
              width: { xs: "100%", md: "35%" },
              backgroundColor: "#f4f4f4",
              borderRadius: { xs: "0px 0px 25px 25px", md: "0px 25px 25px 0px" },
            }}
          >
            <EnrollmentForm />
          </Box>
        </Box>
      </Box>

      {/* Detalles del curso (Módulos, Video, etc.) */}
      <CourseDetailPage
        course={courseDataForDetailPage}
        countdownTargetDate={countdownTarget}
      />

      {/* Sección de Certificado y Datos Clave */}
      <FactsAndCertificate
        certificateSubtitle={apiData.subtitulo}
        certificateLongDescription={apiData.descripcion_larga}
        facts={factsData}
        brandingData={apiData.marcaAsociada || []}
      />

      {/* Preguntas Frecuentes */}
      <Box sx={{ padding: { xs: "20px", md: "0px 170px" } }}>
        <FaqSection courseId={numericCourseId} />
      </Box>

      {/* Último llamado a la acción */}
      <CenteredCallToAction {...customCallToActionData} />
      
      <Footer />
    </>
  );
}

export default InformacionView;