import React, { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import ProgressBar from "./components/progreso.jsx";
import VideoPlayerWithControls from "../../../videos/VideoPlayerWithControls.jsx";
import VideoList from "./components/VideoList.jsx";
import Footer from "../../../footer/pieDePagina.jsx";
import ProgressAccordion from "./components/ProgressAcordion";
import Resources from "./components/resources.jsx";

const VideoLayout = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // El video actual ahora se identificará por su ID de clase
  const [currentVideoId, setCurrentVideoId] = useState(() => {
    // No recuperamos del localStorage al inicio para forzar la primera clase
    // Pero si quieres mantener la funcionalidad de localStorage, puedes comentarme
    // const savedVideoId = localStorage.getItem("currentVideoId");
    // return savedVideoId || null;
    return null; // Inicializamos a null para que la lógica de useEffect lo establezca
  });

  // Los videos completados ahora se guardarán por su ID de clase
  const [completedVideoIds, setCompletedVideoIds] = useState(() => {
    const savedCompletedVideoIds = JSON.parse(
      localStorage.getItem("completedVideoIds")
    );
    return savedCompletedVideoIds || [];
  });

  // Efecto para cargar los módulos y clases
  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!courseId) {
        setError("No se proporcionó un ID de curso.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getModulosCurso", id: courseId }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error HTTP al cargar módulos: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        // console.log("Respuesta de getModulosPorCursoController.php:", data);

        if (data.status === "success" && Array.isArray(data.modulos)) {
          const sortedModules = data.modulos.sort((a, b) => a.orden - b.orden);

          const modulesWithClasses = await Promise.all(
            sortedModules.map(async (module) => {
              try {
                const classResponse = await fetch(
                  "https://apiacademy.hitpoly.com/ajax/traerTodasClasesController.php",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion: "getClases", id: module.id }),
                  }
                );

                if (!classResponse.ok) {
                  const errorText = await classResponse.text();
                  console.error(`Error HTTP al cargar clases para el módulo ${module.id}: ${classResponse.status} - ${errorText}`);
                  return { ...module, classes: [] };
                }

                const classData = await classResponse.json();
                // console.log(`Respuesta de clases para el módulo ${module.id}:`, classData);

                if (classData.status === "success" && Array.isArray(classData.clases)) {
                  // **FILTRADO EN EL FRONTEND: Filtramos las clases por el ID del módulo actual**
                  // Asegúrate de que 'modulo_id' es el nombre correcto en tu API para la relación.
                  const filteredClasses = classData.clases.filter(clase =>
                    String(clase.modulo_id) === String(module.id)
                  );

                  const formattedClasses = filteredClasses
                    .map(clase => ({
                      id: clase.id,
                      title: clase.titulo,
                      // *** CAMBIO AQUÍ: Ahora usa 'url_video' ***
                      videoUrl: clase.url_video, // Asumiendo que la API devuelve 'url_video'
                      resources: clase.recursos || [],
                      progressPanels: clase.paneles_progreso || [],
                    }))
                    .sort((a, b) => a.orden - b.orden); // Asumiendo que las clases tienen una propiedad 'orden'
                  return {
                    id: module.id,
                    title: module.titulo,
                    order: module.orden,
                    classes: formattedClasses,
                  };
                } else {
                  console.warn(`No se encontraron clases para el módulo ${module.id} o formato inesperado.`, classData);
                  return { ...module, classes: [] };
                }
              } catch (err) {
                console.error(`Excepción al cargar clases para el módulo ${module.id}: ${err.message}`);
                return { ...module, classes: [] };
              }
            })
          );
          setModules(modulesWithClasses);
          // console.log("Módulos con clases después de formatear y filtrar:", modulesWithClasses);

          // *** CAMBIO AQUÍ: Establecer la primera clase del primer módulo por defecto ***
          if (modulesWithClasses.length > 0) {
            const firstModuleWithClasses = modulesWithClasses.find(m => m.classes && m.classes.length > 0);
            if (firstModuleWithClasses) {
              setCurrentVideoId(firstModuleWithClasses.classes[0].id);
            }
          }

        } else {
          setError(data.message || "Error al cargar los módulos o formato de datos inesperado en la respuesta.");
          setModules([]);
        }
      } catch (err) {
        setError(`No se pudieron cargar los módulos o clases: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId]); // Se ejecuta cuando cambia el courseId

  // Efecto para guardar el video actual en localStorage
  useEffect(() => {
    if (currentVideoId) {
      localStorage.setItem("currentVideoId", currentVideoId);
    }
  }, [currentVideoId]);

  // Efecto para guardar los videos completados en localStorage
  useEffect(() => {
    localStorage.setItem("completedVideoIds", JSON.stringify(completedVideoIds));
  }, [completedVideoIds]);

  // Función para encontrar la clase actual
  const getCurrentClass = () => {
    for (const module of modules) {
      const foundClass = module.classes?.find(clase => clase.id === currentVideoId);
      if (foundClass) {
        return foundClass;
      }
    }
    return null; // Si no se encuentra la clase
  };

  const currentClass = getCurrentClass();

  // Cambiar el video/clase seleccionado
  const handleVideoChange = (clase) => {
    setCurrentVideoId(clase.id);
  };

  // Marcar video como completado al finalizar
  const handleVideoEnd = () => {
    setCompletedVideoIds((prev) => {
      if (currentClass && !prev.includes(currentClass.id)) {
        return [...prev, currentClass.id];
      }
      return prev;
    });
  };

  // Alternar el estado de completado de un video manualmente
  const toggleCompletedVideo = (claseId) => {
    setCompletedVideoIds((prev) =>
      prev.includes(claseId)
        ? prev.filter((id) => id !== claseId)
        : [...prev, claseId]
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando contenido del curso...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>Por favor, recarga la página o contacta con soporte.</Typography>
      </Box>
    );
  }

  // Si no hay clases cargadas pero ya terminó la carga y no hay error
  if (!currentClass && modules.length > 0 && !loading && !error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Selecciona una clase para empezar.</Typography>
        <VideoList
          modules={modules}
          onSelectVideo={handleVideoChange}
          completedVideos={completedVideoIds}
          toggleCompletedVideo={toggleCompletedVideo}
          selectedVideoId={currentVideoId}
        />
        <Footer />
      </Box>
    );
  }

  // Si no hay módulos o clases después de la carga
  if (modules.length === 0 || !currentClass) {
      return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">No hay contenido disponible para este curso.</Typography>
              <Footer />
          </Box>
      );
  }

  return (
    <>
      <Box
        sx={{
          padding: { xs: "20px", md: "0px 50px" },
          marginTop: { xs: "20px", md: "10px" },
        }}
      >
        <ProgressBar
          completedVideos={completedVideoIds}
          totalVideos={modules.reduce((acc, mod) => acc + (mod.classes?.length || 0), 0)}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          padding: { xs: "20px", md: "0px 50px" },
          gap: "20px",
        }}
      >
        <Box sx={{ flex: 7, padding: "0px" }}>
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              marginBottom: "30px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#00695C", flexGrow: 1, textAlign: "center" }}
            >
              {currentClass?.title}
            </Typography>
          </Box>
          <VideoPlayerWithControls
            videoUrl={currentClass.videoUrl}
            onVideoCompleted={handleVideoEnd}
          />
        </Box>
        <Box sx={{ flex: 3, marginTop: { xs: "30px", md: "0px" } }}>
          <VideoList
            modules={modules}
            onSelectVideo={handleVideoChange}
            completedVideos={completedVideoIds}
            toggleCompletedVideo={toggleCompletedVideo}
            selectedVideoId={currentVideoId}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          padding: { xs: "20px", md: "0px 50px" },
          marginTop: { xs: "0px", md: "40px" },
          gap: "20px",
        }}
      >
        <Box sx={{ flex: 7 }}>
          <Resources resources={currentClass?.resources} />
        </Box>
        <Box sx={{ flex: 3 }}>
          <ProgressAccordion
            key={currentVideoId}
            panels={currentClass?.progressPanels || []}
          />
        </Box>
      </Box>

      <Box sx={{ marginTop: "40px" }}>
        <Footer />
      </Box>
    </>
  );
};

export default VideoLayout;