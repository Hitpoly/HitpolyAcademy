// VideoLayout.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import ProgressBar from "./components/progreso.jsx";
import VideoPlayerWithControls from "../../../videos/VideoPlayerWithControls.jsx";
import VideoList from "./components/VideoList.jsx";
import Footer from "../../../footer/pieDePagina.jsx";
import Resources from "./components/resources.jsx";
import CommentSection from "./components/comentarios/CommentSection.jsx";
import useCourseVideoLogic from "./logic/useCourseVideoLogic"; 

const VideoLayout = ({ courseId }) => {
  const {
    modules,
    loading,
    error,
    currentVideoId,
    completedVideoIdsLocal,
    currentClass,
    currentClassResources,
    totalCourseVideos,
    completedVideosCount,
    handleVideoChange,
    handleVideoEnd,
    toggleCompletedVideo,
  } = useCourseVideoLogic(courseId);

  // Estado para controlar la expansión de la descripción
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Reinicia el estado de expansión cuando cambia la clase
  useEffect(() => {
    setShowFullDescription(false);
  }, [currentClass]);

  // --- LOGS DE DEPURACIÓN (Mantener si aún los necesitas, de lo contrario puedes removerlos) ---
  useEffect(() => {
    console.log("VideoLayout - Estado de carga:", { loading, error });
    console.log("VideoLayout - Modules:", modules);
    console.log("VideoLayout - currentVideoId:", currentVideoId);
    console.log("VideoLayout - completedVideoIdsLocal:", completedVideoIdsLocal);
    console.log("VideoLayout - totalCourseVideos:", totalCourseVideos);
    console.log("VideoLayout - completedVideosCount:", completedVideosCount);
  }, [loading, error, modules, currentVideoId, completedVideoIdsLocal, totalCourseVideos, completedVideosCount]);

  useEffect(() => {
    console.log("VideoLayout - currentClass:", currentClass);
    if (currentClass) {
      console.log("VideoLayout - currentClass.title:", currentClass.title);
      console.log("VideoLayout - currentClass.videoUrl:", currentClass.videoUrl);
      console.log("VideoLayout - currentClass.description:", currentClass.description);
    } else {
      console.log("VideoLayout - currentClass es null o undefined.");
    }
    console.log("VideoLayout - currentClassResources:", currentClassResources);
  }, [currentClass, currentClassResources]);
  // --- FIN LOGS DE DEPURACIÓN ---


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
          completedVideos={completedVideoIdsLocal}
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

  // Obtenemos la descripción de la clase
  const descriptionText = currentClass?.description || "";
  // Determinamos si la descripción es lo suficientemente larga como para necesitar "Ver más"
  const needsTruncation = descriptionText.length > 150; // Ajusta este valor según la longitud típica de tus descripciones

  return (
    <>
      <Box
        sx={{
          padding: { xs: "20px", md: "0px 50px" },
          marginTop: { xs: "20px", md: "10px" },
        }}
      >
        <ProgressBar
          totalVideos={totalCourseVideos}
          completedVideosCount={completedVideosCount}
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
          {/* Aquí se añade la descripción de la clase con "Ver más" */}
          {currentClass?.description && (
            <Box sx={{ mt: 3, mb: 4, p: 2, borderRadius: '8px', bgcolor: 'background.paper', boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Descripción de la clase
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: showFullDescription ? 'unset' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {descriptionText}
              </Typography>
              {needsTruncation && (
                <Button 
                  onClick={() => setShowFullDescription(!showFullDescription)} 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 1 }}
                >
                  {showFullDescription ? "Ver menos" : "Ver más"}
                </Button>
              )}
            </Box>
          )}
          
          {/* Sección de Comentarios para celulares (display: block en xs, none en md y arriba) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: { xs: 4, md: 0 } }}>
            <CommentSection claseId={currentVideoId} />
          </Box>

        </Box> {/* Fin del Box principal de Video/Descripción */}

        <Box sx={{ flex: 3, marginTop: { xs: "30px", md: "0px" } }}>
          <VideoList
            modules={modules}
            onSelectVideo={handleVideoChange}
            completedVideos={completedVideoIdsLocal}
            toggleCompletedVideo={toggleCompletedVideo}
            selectedVideoId={currentVideoId}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Cambiado a 'column' en xs para que los recursos vayan después de comentarios si los comentarios están aparte
          padding: { xs: "20px", md: "0px 50px" },
          marginTop: { xs: "0px", md: "40px" },
          gap: "20px",
        }}
      >
        {/* Sección de Comentarios para escritorio (display: none en xs, block en md y arriba) */}
        <Box sx={{ flex: 7, display: { xs: 'none', md: 'block' } }}>
          <CommentSection claseId={currentVideoId} />
        </Box>
        <Box sx={{ flex: 3 }}>
          <Resources resources={currentClassResources} />
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default VideoLayout;