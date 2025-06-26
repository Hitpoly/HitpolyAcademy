import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import ProgressBar from "./components/progreso.jsx";
import VideoPlayerWithControls from "../../../videos/VideoPlayerWithControls.jsx";
import VideoList from "./components/VideoList.jsx";
import Footer from "../../../footer/pieDePagina.jsx";
import Resources from "./components/resources.jsx";
import CommentSection from "./components/comentarios/CommentSection.jsx";

const VideoLayout = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allResources, setAllResources] = useState([]);

  const baseUrl = "https://apiacademy.hitpoly.com/";

  const [currentVideoId, setCurrentVideoId] = useState(() => {
    const savedVideoId = localStorage.getItem(
      `currentVideoId_course_${courseId}`
    );
    return savedVideoId ? parseInt(savedVideoId, 10) : null;
  });

  const [completedVideoIds, setCompletedVideoIds] = useState(() => {
    const savedCompletedVideoIds = JSON.parse(
      localStorage.getItem(`completedVideoIds_course_${courseId}`)
    );
    return savedCompletedVideoIds || [];
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        setError("No se proporcionó un ID de curso.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const modulesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getModulosCurso", id: courseId }),
          }
        );

        if (!modulesResponse.ok) {
          const errorText = await modulesResponse.text();
          throw new Error(
            `Error HTTP al cargar módulos: ${modulesResponse.status} - ${errorText}`
          );
        }

        const modulesData = await modulesResponse.json();

        if (
          modulesData.status === "success" &&
          Array.isArray(modulesData.modulos)
        ) {
          const sortedModules = modulesData.modulos.sort(
            (a, b) => a.orden - b.orden
          );

          const modulesWithClasses = await Promise.all(
            sortedModules.map(async (module) => {
              try {
                const classResponse = await fetch(
                  "https://apiacademy.hitpoly.com/ajax/traerTodasClasesController.php",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      accion: "getClases",
                      id: module.id,
                    }),
                  }
                );

                if (!classResponse.ok) {
                  const errorText = await classResponse.text();
                  throw new Error(
                    `Error HTTP al cargar clases para el módulo ${module.id}: ${classResponse.status} - ${errorText}`
                  );
                }

                const classData = await classResponse.json();

                if (
                  classData.status === "success" &&
                  Array.isArray(classData.clases)
                ) {
                  const filteredClasses = classData.clases.filter(
                    (clase) => String(clase.modulo_id) === String(module.id)
                  );

                  const formattedClasses = filteredClasses
                    .map((clase) => ({
                      id: clase.id,
                      title: clase.titulo,
                      videoUrl: clase.url_video,
                      progressPanels: clase.paneles_progreso || [],
                      orden: clase.orden,
                    }))
                    .sort((a, b) => a.orden - b.orden);
                  return {
                    id: module.id,
                    title: module.titulo,
                    order: module.orden,
                    classes: formattedClasses,
                  };
                } else {
                  return { ...module, classes: [] };
                }
              } catch (err) {
                return { ...module, classes: [] };
              }
            })
          );
          setModules(modulesWithClasses);

          if (currentVideoId === null && modulesWithClasses.length > 0) {
            const firstModuleWithClasses = modulesWithClasses.find(
              (m) => m.classes && m.classes.length > 0
            );
            if (firstModuleWithClasses) {
              setCurrentVideoId(firstModuleWithClasses.classes[0].id);
            }
          }
        } else {
          setError(
            modulesData.message ||
              "Error al cargar los módulos o formato de datos inesperado en la respuesta."
          );
          setModules([]);
        }

        const resourcesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getAllRecursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getRecursos" }),
          }
        );

        if (!resourcesResponse.ok) {
          const errorText = await resourcesResponse.text();
          throw new Error(
            `Error HTTP al cargar recursos: ${resourcesResponse.status} - ${errorText}`
          );
        }

        const resourcesData = await resourcesResponse.json();

        if (
          resourcesData.status === "success" &&
          Array.isArray(resourcesData.recursos)
        ) {
          const formattedResources = resourcesData.recursos.map((resource) => ({
            ...resource,
            fullUrl: resource.url.startsWith("http")
              ? resource.url
              : baseUrl + resource.url,
          }));
          setAllResources(formattedResources);
        } else {
          setAllResources([]);
        }
      } catch (err) {
        setError(`No se pudieron cargar los datos del curso: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (currentVideoId !== null) {
      localStorage.setItem(
        `currentVideoId_course_${courseId}`,
        currentVideoId.toString()
      );
    }
  }, [currentVideoId, courseId]);

  useEffect(() => {
    localStorage.setItem(
      `completedVideoIds_course_${courseId}`,
      JSON.stringify(completedVideoIds)
    );
  }, [completedVideoIds, courseId]);

  const getCurrentClass = useCallback(() => {
    for (const module of modules) {
      const foundClass = module.classes?.find(
        (clase) => clase.id === currentVideoId
      );
      if (foundClass) {
        return foundClass;
      }
    }
    return null;
  }, [modules, currentVideoId]);

  const currentClass = getCurrentClass();

  const currentClassResources = currentVideoId
    ? allResources.filter(
        (resource) => String(resource.clase_id) === String(currentVideoId)
      )
    : [];

  const handleVideoChange = useCallback((clase) => {
    setCurrentVideoId(clase.id);
  }, []);

  const handleVideoEnd = useCallback(() => {
    setCompletedVideoIds((prev) => {
      if (currentClass && !prev.includes(currentClass.id)) {
        return [...prev, currentClass.id];
      }
      return prev;
    });
  }, [currentClass]);

  const toggleCompletedVideo = useCallback((claseId) => {
    setCompletedVideoIds((prev) =>
      prev.includes(claseId)
        ? prev.filter((id) => id !== claseId)
        : [...prev, claseId]
    );
  }, []);

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
          Cargando contenido del curso...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">{error}</Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Por favor, recarga la página o contacta con soporte.
        </Typography>
      </Box>
    );
  }

  if (!currentClass && modules.length > 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
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

  if (modules.length === 0 || !currentClass) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">
          No hay contenido disponible para este curso.
        </Typography>
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
          totalVideos={modules.reduce(
            (acc, mod) => acc + (mod.classes?.length || 0),
            0
          )}
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
          flexDirection: { xs: "column-reverse", md: "row" }, // Aquí está el cambio clave
          padding: { xs: "20px", md: "0px 50px" },
          marginTop: { xs: "0px", md: "40px" },
          gap: "20px",
        }}
      >
        {/* Este Box contiene los Comentarios */}
        <Box sx={{ flex: 7 }}>
          <CommentSection claseId={currentVideoId} />
        </Box>
        {/* Este Box contiene los Recursos */}
        <Box sx={{ flex: 3 }}>
          <Resources resources={currentClassResources} />
        </Box>
      </Box>
    </>
  );
};

export default VideoLayout;