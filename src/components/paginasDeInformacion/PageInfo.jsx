import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useParams } from 'react-router-dom'; 

import ProgrammeDetailsBanner from "../banners/infoCurso";
import EnrollmentForm from "../forms/EnrollmentForm";
import FactsAndCertificate from "./components/baner/FactsAndCertificate";
import Footer from "../footer/pieDePagina";
import CenteredCallToAction from "../banners/llamadoALaAccion";
import FaqSection from "./components/FaqSection";

function PaginaDeInformacion() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id: courseIdFromUrl } = useParams(); 

  useEffect(() => {
    const fetchCourseData = async () => {
      // Log para ver el ID que se está intentando cargar
      console.log("Intentando cargar curso con ID desde URL:", courseIdFromUrl);

      if (!courseIdFromUrl) {
        setError("ID del curso no proporcionado en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accion: "getCursos" }), 
          }
        );

        // Log para ver la respuesta bruta del fetch
        console.log("Respuesta bruta del fetch de cursos:", response);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error HTTP al obtener datos de los cursos: ${response.status}, mensaje: ${errorText}`
          );
        }

        const data = await response.json();
        // Log para ver los datos completos recibidos de la API (antes de filtrar)
        console.log("Datos completos de la API (todos los cursos):", data);

        if (data.status === "success" && Array.isArray(data.cursos)) {
          const foundCourse = data.cursos.find(
            (curso) => String(curso.id) === String(courseIdFromUrl) 
          );

          // Log para ver el curso encontrado (o si es undefined si no lo encuentra)
          console.log("Curso encontrado por ID:", foundCourse);

          if (foundCourse) {
            setApiData(foundCourse);
          } else {
            setError(`Curso con ID ${courseIdFromUrl} no encontrado.`);
          }
        } else {
          setError(data.message || "Error al obtener datos de los cursos.");
        }
      } catch (err) {
        setError(
          "No se pudo conectar con el servidor para obtener los datos del curso o hubo un error de red."
        );
        console.error("Error fetching course data:", err); // Este ya estaba, es bueno mantenerlo
      } finally {
        setLoading(false);
      }
    };

    if (courseIdFromUrl) {
      fetchCourseData();
    }
  }, [courseIdFromUrl]); 

  // Log para ver el estado final de apiData (el curso que se está renderizando)
  useEffect(() => {
    if (apiData) {
      console.log("Estado actual de apiData (curso renderizado):", apiData);
    }
  }, [apiData]);


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
          No se pudo cargar la información del curso. Esto puede ocurrir si el ID no es válido o si el curso no existe.
        </Alert>
      </Box>
    );
  }

  const {
    titulo,
    descripcion_larga,
    duracion_estimada,
    horas_por_semana,
    fecha_inicio_clases,
    fecha_limite_inscripcion,
    ritmo_aprendizaje,
    tipo_clase,
    titulo_credencial,
    descripcion_credencial,
  } = apiData;

  const programmeDetailsForBanner = {
    programmeName: titulo || "Título no disponible",
    description: descripcion_larga || "Descripción no disponible",
    duration: duracion_estimada || "Duración no disponible",
    hoursPerWeek: horas_por_semana || "N/A",
    startDate: fecha_inicio_clases || "Próximamente",
    enrollmentDeadline: fecha_limite_inscripcion || "Abiertas",
    activationDate: "N/A", 
    learningPace: ritmo_aprendizaje || "Flexible",
    classType: tipo_clase || "Online",
    credentialTitle: titulo_credencial || "Certificado",
    credentialDescription:
      descripcion_credencial || "Otorgado al completar",
    instructorData: {
      name: "Instructor por determinar", 
      avatar: "/images/default-avatar.png",
      description: "Experto en el área.",
    },
    brandingData: [], 
  };

  const certificateData = {
    title: titulo_credencial || "Certificado de Finalización",
    paragraphs: [descripcion_credencial || "Al finalizar este curso, recibirás un certificado que valida tus conocimientos."],
    note: "Este certificado es reconocido por las marcas asociadas (si aplica).",
  };

  const factsData = {
    title: "Datos Clave del Curso",
    items: [
      { value: duracion_estimada || "N/A", description: "Duración estimada", source: "" },
      { value: horas_por_semana || "N/A", description: "Horas por semana", source: "" },
      { value: apiData.nivel || "N/A", description: "Nivel del curso", source: "" },
      { value: ritmo_aprendizaje || "N/A", description: "Ritmo de aprendizaje", source: "" },
      { value: tipo_clase || "N/A", description: "Tipo de clase", source: "" },
    ],
  };

  return (
    <>
      <Box
        sx={{
          height: { xs: "100%", md: "100vh" },
          backgroundImage: `url(${apiData.url_banner || 'images/fondoCursos.jpg'})`, 
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

      <FactsAndCertificate
        certificate={certificateData}
        facts={factsData}
        brandingData={[]} 
      />
      <Box sx={{ padding: { xs: "20px", md: "0px 170px" } }}>
        <FaqSection
          faqs={[]} 
          initialVisibleCount={3}
          sectionTitle="Preguntas Frecuentes sobre el Curso"
        />
      </Box>
      <CenteredCallToAction {...apiData.callToActionData} /> 
      <Footer />
    </>
  );
}

export default PaginaDeInformacion;