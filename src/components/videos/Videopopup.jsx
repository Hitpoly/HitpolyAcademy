import React, { useRef, useCallback } from "react";
import { Box } from "@mui/material";
import YouTube from "react-youtube";

const getYouTubeVideoId = (url) => {
  const regExp = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?/ ]{11})/;
  const match = url?.match(regExp);
  return match ? match[1] : null;
};

const Videopopup = ({ videoUrl, onPlayerReady, onYouTubeStateChange, hasStarted, initialTime, controls = 1 }) => {
  const videoRef = useRef(null);
  const videoId = getYouTubeVideoId(videoUrl);
  const isYT = !!videoId;

  const startTime = (initialTime > 2) ? Math.floor(initialTime) : 0;

  const opts = {
    playerVars: {
      autoplay: 0,
      controls: 1, 
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: window.location.origin,
    },
  };

  const handleReady = useCallback(
    (e) => {
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
        backgroundColor: "transparent",
        overflow: "hidden",
        "& .yt-root": {
          position: "absolute",
          inset: 0, // Volvemos al tamaño normal
          width: "100%",
          height: "100%",
        },
        "& .yt-iframe": {
          width: "100%",
          height: "100%",
        },
      }}
    >
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
          src={videoUrl?.includes('#t=') ? videoUrl : `${videoUrl}#t=${startTime > 0 ? startTime : 0.5}`}
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              // Para vídeo nativo, si hay tiempo inicial, lo aplicamos
              if (startTime > 0) {
                videoRef.current.currentTime = startTime;
              }

              const shim = {
                playVideo: () => videoRef.current.play(),
                pauseVideo: () => videoRef.current.pause(),
                seekTo: (t) => { videoRef.current.currentTime = t; },
                getCurrentTime: () => videoRef.current.currentTime,
                getDuration: () => videoRef.current.duration,
                setVolume: (v) => { videoRef.current.volume = v / 100; },
                isMuted: () => videoRef.current.muted,
                mute: () => { videoRef.current.muted = true; },
                unMute: () => { videoRef.current.muted = false; },
                getPlayerState: () => videoRef.current.paused ? 2 : 1,
                getIframe: () => ({ src: videoUrl }),
                stopVideo: () => {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              };
              onPlayerReady?.(shim);
            }
          }}
          onPlay={() => onYouTubeStateChange?.(1)}
          onPause={() => onYouTubeStateChange?.(2)}
          onEnded={() => onYouTubeStateChange?.(0)}
        />
      )}
    </Box>
  );
};

export default Videopopup;