import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import DynamicMeta from "../../utils/DynamicMeta";
import ProgrammeDetailsBanner from "../banners/infoCurso";
import EnrollmentForm from "../forms/cursoForm/EnrollmentForm";
import FactsAndCertificate from "./components/baner/FactsAndCertificate";
import Footer from "../footer/pieDePagina";
import CenteredCallToAction from "../banners/llamadoALaAccion";
import FaqSection from "./components/FaqSection";
import { useParams } from "react-router-dom";
import { useEnrollmentLogic } from "../forms/cursoForm/logic/useEnrollmentLogic";
import CourseDetailPage from "./components/CourseDetailPage";

function InformacionView({ 
  apiData, 
  instructorName, 
  modulesWithClasses, 
  programmeDetails, // Este ya viene procesado del padre
  factsData,        // Este ya viene procesado del padre
  numericCourseId 
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery("(min-width:1300px)");
  const { id: urlSlugFromParams } = useParams();
  const { isAuthenticated, isEnrolled, extractCourseIdFromSlug, user } = useEnrollmentLogic(urlSlugFromParams);
  const courseId = extractCourseIdFromSlug(urlSlugFromParams);
  const [offerDialogOpen, setOfferDialogOpen] = React.useState(false);
  const [isInCart, setIsInCart] = React.useState(false);

  // Verificar si el curso ya está en el carrito
  React.useEffect(() => {
    const checkCart = async () => {
      const actualUserId = user?.id || user?.user_id;
      if (isAuthenticated && actualUserId && apiData?.id) {
        try {
          const res = await fetch("https://apiweb.hitpoly.com/ajax/carritoController.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ accion: "getItems", usuario_id: actualUserId }),
          });
          const data = await res.json();
          if (data.status === "success") {
            const alreadyInCart = data.items.some(item =>
              String(item.producto_id) === String(apiData.id) && item.tipo === "curso"
            );
            setIsInCart(alreadyInCart);
          }
        } catch (e) {
          console.error("[ACADEMY] Error checking cart:", e);
        }
      }
    };
    checkCart();
  }, [isAuthenticated, user, apiData.id]);
  
  // 1. Re-calculamos datos específicos para CourseDetailPage
  const temarioForDisplay = apiData.temario && Array.isArray(apiData.temario)
    ? apiData.temario.map((item) => item.titulo || "Tema sin título")
    : [];

  const courseDataForDetailPage = {
    id: apiData.id,
    title: apiData.titulo,
    description: apiData.descripcion_larga,
    instructor: instructorName,
    duration: apiData.duracion_estimada,
    level: apiData.nivel,
    price: apiData.precio,
    portada_targeta: apiData.portada_targeta,
    oferta: apiData.oferta,
    inductionVideoUrl: apiData.url_video_introductorio,
    modules: modulesWithClasses,
    learningOutcomes: temarioForDisplay,
    categoria_id: apiData.categoria_id,
    profesor_id: apiData.profesor_id,
  };

  // 2. Formateo de fechas para el Countdown
  const countdownTarget = apiData.fecha_limite_inscripcion && apiData.fecha_limite_inscripcion !== "Abiertas"
    ? `${apiData.fecha_limite_inscripcion}T23:59:59`
    : null;

  // 3. Configuración completa del Call To Action
  const isUserEnrolled = isAuthenticated && isEnrolled;
  
  const customCallToActionData = {
    title: isUserEnrolled ? `¡Continúa con tu aprendizaje!` : `Regístrate en ${apiData.titulo}`,
    subtitle: isUserEnrolled ? "Accede ahora mismo a tus clases y materiales." : "¡Asegura tu cupo hoy y transforma tu futuro profesional!",
    buttonText: isUserEnrolled ? "Acceder al Curso" : "Inscríbete Ahora",
    buttonLink: isUserEnrolled ? `/master-full/${courseId}` : "#enrollment-form",
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
            flexDirection: isDesktop ? "row" : "column",
            backgroundColor: "#FFFFFF",
            borderRadius: "25px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            gap: isDesktop ? 10 : 0,
            width: "100%"
          }}
        >
          <Box sx={{ width: isDesktop ? "65%" : "100%" }}>
            <ProgrammeDetailsBanner {...programmeDetails} />
          </Box>
          <Box
            id="enrollment-form"
            sx={{
              width: isDesktop ? "35%" : "100%",
              backgroundColor: "#f4f4f4",
              borderRadius: isDesktop ? "0px 25px 25px 0px" : "0px 0px 25px 25px",
            }}
          >
            <EnrollmentForm 
              onSuccess={() => setOfferDialogOpen(true)} 
              isInCart={isInCart} 
            />
          </Box>
        </Box>
      </Box>

      {/* Detalles del curso (Módulos, Video, etc.) */}
      <CourseDetailPage
        course={courseDataForDetailPage}
        countdownTargetDate={countdownTarget}
        externalOfferOpen={offerDialogOpen}
        setExternalOfferOpen={setOfferDialogOpen}
        initialIsInCart={isInCart}
        onCartChange={setIsInCart}
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