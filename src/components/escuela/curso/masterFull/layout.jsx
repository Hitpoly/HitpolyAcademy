import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import ProgressBar from "./components/progreso.jsx";
import VideoPlayer from "./components/videoPlayer.jsx";
import VideoList from "./components/VideoList.jsx";
import Footer from "../../../footer/pieDePagina.jsx";
import ProgressAccordion from "./components/ProgressAcordion";
import Resources from "./components/resources.jsx";

const VideoLayout = ({ activities }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(() => {
    const savedIndex = localStorage.getItem("currentVideoIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  const [completedVideos, setCompletedVideos] = useState(() => {
    const savedCompletedVideos = JSON.parse(
      localStorage.getItem("completedVideos")
    );
    return savedCompletedVideos || [];
  });

  useEffect(() => {
    localStorage.setItem("currentVideoIndex", currentVideoIndex);
  }, [currentVideoIndex]);

  useEffect(() => {
    if (completedVideos.length > 0) {
      localStorage.setItem("completedVideos", JSON.stringify(completedVideos));
    }
  }, [completedVideos]);

  const handleVideoChange = (index) => setCurrentVideoIndex(index);

  const handleVideoEnd = () => {
    setCompletedVideos((prev) => [...prev, currentVideoIndex]);
  };

  const toggleCompletedVideo = (index) => {
    setCompletedVideos((prev) =>
      prev.includes(index)
        ? prev.filter((videoIndex) => videoIndex !== index)
        : [...prev, index]
    );
  };

  return (
    <>
      <Box
        sx={{
          padding: { xs: "20px", md: "0px 50px" },
          marginTop: { xs: "20px", md: "10px" },
        }}
      >
        <ProgressBar
          completedVideos={completedVideos}
          totalVideos={activities.length}
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
              {activities[currentVideoIndex]?.title}
            </Typography>
          </Box>
          <VideoPlayer
            videoUrl={activities[currentVideoIndex].videoUrl}
            onVideoEnd={handleVideoEnd}
          />
        </Box>
        <Box sx={{ flex: 3, marginTop: { xs: "30px", md: "0px" } }}>
          <VideoList
            activities={activities}
            onSelectVideo={handleVideoChange}
            completedVideos={completedVideos}
            toggleCompletedVideo={toggleCompletedVideo}
            selectedVideoIndex={currentVideoIndex}
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
          <Resources resources={activities[currentVideoIndex]?.resources} />
        </Box>
        <Box sx={{ flex: 3 }}>
          <ProgressAccordion
            key={currentVideoIndex}
            panels={activities[currentVideoIndex]?.progressPanels || []}
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
