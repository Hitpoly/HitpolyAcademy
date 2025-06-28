// VideoLayout.jsx
import React from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import ProgressBar from "./components/progreso.jsx";
import VideoPlayerWithControls from "../../../videos/VideoPlayerWithControls.jsx";
import VideoList from "./components/VideoList.jsx";
import Footer from "../../../footer/pieDePagina.jsx";
import Resources from "./components/resources.jsx";
import CommentSection from "./components/comentarios/CommentSection.jsx";
import useCourseVideoLogic from "./logic/useCourseVideoLogic"; // Importa el nuevo hook

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
  } = useCourseVideoLogic(courseId); // Consume el hook

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
        </Box>
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
          flexDirection: { xs: "column-reverse", md: "row" },
          padding: { xs: "20px", md: "0px 50px" },
          marginTop: { xs: "0px", md: "40px" },
          gap: "20px",
        }}
      >
        <Box sx={{ flex: 7 }}>
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