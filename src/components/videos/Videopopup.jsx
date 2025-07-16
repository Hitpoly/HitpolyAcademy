// src/components/videos/Videopopup.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import YouTube from 'react-youtube';

const getYouTubeVideoId = (url) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\s&]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url?.match(regExp);
  return match && match[1] ? match[1] : null;
};

// Asegúrate de que onYouTubeStateChange se recibe aquí
const Videopopup = ({ videoUrl, onPlayerReady, onYouTubeStateChange }) => { // <--- Agregamos onYouTubeStateChange
  const videoRef = useRef(null);

  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const isYouTubeVideo = !!youtubeVideoId;

  const youtubeOpts = {
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
    },
  };

  const fillParentStyles = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    border: 0,
    pointerEvents: 'none',
  };

  const handleYouTubeReady = useCallback((event) => {
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  }, [onPlayerReady]);

  // Manejador de cambio de estado para YouTube
  const handleYouTubeStateChange = useCallback((event) => {
    if (onYouTubeStateChange) { // <--- Llama al callback si existe
      onYouTubeStateChange(event.data); // event.data contiene el estado (PLAYING, PAUSED, ENDED, etc.)
    }
  }, [onYouTubeStateChange]);

  useEffect(() => {
    if (!videoUrl) return;

    if (videoRef.current && isYouTubeVideo) {
      videoRef.current.src = "";
    }

    if (!isYouTubeVideo) {
      if (videoRef.current) {
        if (onPlayerReady) {
          onPlayerReady(videoRef.current);
        }
      }
    }

    return () => {
      if (videoRef.current && !isYouTubeVideo) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [videoUrl, isYouTubeVideo, onPlayerReady]);

  if (!videoUrl) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: '#000',
        overflow: 'hidden',
        '& iframe': {
          ...fillParentStyles,
        },
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isYouTubeVideo ? (
        <YouTube
          videoId={youtubeVideoId}
          opts={youtubeOpts}
          className="yt-player"
          style={fillParentStyles}
          onReady={handleYouTubeReady}
          onStateChange={handleYouTubeStateChange}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          controls={false}
          style={{ ...fillParentStyles, objectFit: 'contain' }}
          title="Video del curso"
        />
      )}
    </Box>
  );
};

export default Videopopup;