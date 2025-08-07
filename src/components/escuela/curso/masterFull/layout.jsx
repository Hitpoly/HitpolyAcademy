import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from "@mui/material";
import ProgressBar from "./components/progreso.jsx";
import VideoPlayerWithControls from "../../../videos/VideoPlayerWithControls.jsx";
import VideoList from "./components/VideoList.jsx";
import Footer from "../../../footer/pieDePagina.jsx";
import Resources from "./components/resources.jsx";
import CommentSection from "./components/comentarios/CommentSection.jsx";
import useCourseVideoLogic from "./logic/useCourseVideoLogic";
import QuizIcon from "@mui/icons-material/Quiz";
import { useNavigate } from "react-router-dom";

const VideoLayout = ({ courseId, finalExamId }) => {
  const navigate = useNavigate();
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
    handleVideoChange: originalHandleVideoChange,
    handleVideoEnd,
    toggleCompletedVideo,
  } = useCourseVideoLogic(courseId);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const videoPlayerRef = useRef(null);

  const allVideosCompleted =
    completedVideosCount === totalCourseVideos && totalCourseVideos > 0;

  useEffect(() => {
    setShowFullDescription(false);
  }, [currentClass]);

  const handleVideoChangeAndScroll = (clase) => {
    originalHandleVideoChange(clase);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleExamClick = () => {
    if (finalExamId) {
      navigate(`/cursos/${courseId}/examen/${finalExamId}`);
    } else {
      }
  };

  const descriptionText = currentClass?.description || "";
  const needsTruncation = descriptionText.length > 150;

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

  if (modules.length === 0 || (!currentClass && modules.length > 0)) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Selecciona una clase para empezar.</Typography>
        <VideoList
          modules={modules}
          onSelectVideo={handleVideoChangeAndScroll}
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
          padding: { xs: "0px", md: "0px 50px" },
          marginTop: { xs: "0px", md: "10px" },
        }}
      >
        <ProgressBar
          totalVideos={totalCourseVideos}
          completedVideosCount={completedVideosCount}
        />

        {/* Lógica de renderizado condicional para el botón del examen */}
        {allVideosCompleted && finalExamId && (
          <Box sx={{ mt: 2, mb: 2, padding: { xs: "0px 20px", md: "0px" } }}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              startIcon={<QuizIcon />}
              onClick={handleExamClick}
            >
              Ir al Examen Final
            </Button>
          </Box>
        )}
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
            ref={videoPlayerRef}
          />
          {currentClass?.description && (
            <Box
              sx={{
                mt: 3,
                mb: 4,
                p: 2,
                borderRadius: "8px",
                bgcolor: "background.paper",
                boxShadow: 1,
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Descripción de la clase
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: showFullDescription ? "unset" : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
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

          <Box
            sx={{ display: { xs: "block", md: "none" }, mt: { xs: 4, md: 0 } }}
          >
            <CommentSection claseId={currentVideoId} />
          </Box>
        </Box>

        <Box sx={{ flex: 3, marginTop: { xs: "30px", md: "0px" } }}>
          <VideoList
            modules={modules}
            onSelectVideo={handleVideoChangeAndScroll}
            completedVideos={completedVideoIdsLocal}
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
        <Box sx={{ flex: 7, display: { xs: "none", md: "block" } }}>
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
