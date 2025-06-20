import React, { useRef, useEffect } from "react";
import { Box } from "@mui/material";

const VideoPlayer = ({ videoUrl, onVideoEnd }) => {
  const videoRef = useRef(null);

  const handleVideoEnd = () => {
    onVideoEnd();
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onended = handleVideoEnd;
    }
  }, [videoUrl]);

  return (
    <Box>
      <Box sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, overflow: "hidden", position: "relative", width: "100%", paddingBottom: "56.25%" }}>
        <iframe
          ref={videoRef}
          src={videoUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "10px" }}
        />
      </Box>
    </Box>
  );
};

export default VideoPlayer;
