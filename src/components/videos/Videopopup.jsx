import React, { useRef, useCallback } from "react";
import { Box } from "@mui/material";
import YouTube from "react-youtube";

const getYouTubeVideoId = (url) => {
  const regExp = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?/ ]{11})/;
  const match = url?.match(regExp);
  return match ? match[1] : null;
};

const Videopopup = ({ videoUrl, onPlayerReady, onYouTubeStateChange }) => {
  const videoRef = useRef(null);
  const videoId = getYouTubeVideoId(videoUrl);
  const isYT = !!videoId;

  const opts = {
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: window.location.origin,
    },
  };

  const handleReady = useCallback(
    (e) => {
      console.log("🎯 [Videopopup] YouTube API lista");
      onPlayerReady?.(e.target);
    },
    [onPlayerReady]
  );

  const handleStateChange = useCallback(
    (e) => {
      onYouTubeStateChange?.(e.data);
    },
    [onYouTubeStateChange]
  );

  if (!videoUrl) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#000",
        overflow: "hidden",
        "& .yt-root": {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        },
        "& .yt-iframe": {
          width: "100%",
          height: "100%",
        },
      }}
    >
      {/* 🛡️ Franja invisible para bloquear clics arriba */}
      {isYT && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "60px", // Ajusta la altura según necesites
            zIndex: 10,
            backgroundColor: "transparent",
            cursor: "default",
          }}
        />
      )}

      {isYT ? (
        <YouTube
          videoId={videoId}
          opts={opts}
          className="yt-root"
          iframeClassName="yt-iframe"
          onReady={handleReady}
          onStateChange={handleStateChange}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </Box>
  );
};

export default Videopopup;