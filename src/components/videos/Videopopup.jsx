import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import YouTube from 'react-youtube';

const getYouTubeVideoId = (url) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\s&]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url?.match(regExp);
  return match && match[1] ? match[1] : null;
};

const Videopopup = ({ videoUrl, onPlayerReady, onYouTubeStateChange }) => {
  const videoRef = useRef(null);
  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const isYouTubeVideo = !!youtubeVideoId;

  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      enablejsapi: 1,
      // Usar origin dinámico para evitar el mismatch que vimos en tus logs
      origin: window.location.origin, 
    },
  };

  const handleYouTubeReady = useCallback((event) => {
    // Verificamos que event.target exista antes de pasarlo
    if (event?.target) {
      console.log("🎯 [Videopopup] YouTube API lista");
      onPlayerReady(event.target);
    }
  }, [onPlayerReady]);

  const handleYouTubeStateChange = useCallback((event) => {
    // Agregamos una capa de seguridad para evitar "Script Error"
    try {
      if (onYouTubeStateChange && event?.data !== undefined) {
        onYouTubeStateChange(event.data);
      }
    } catch (e) {
      console.warn("⚠️ Error en cambio de estado de YT controlado");
    }
  }, [onYouTubeStateChange]);

  useEffect(() => {
    if (!videoUrl) return;

    if (!isYouTubeVideo && videoRef.current) {
      onPlayerReady(videoRef.current);
    }

    return () => {
      if (videoRef.current && !isYouTubeVideo) {
        videoRef.current.pause();
      }
    };
  }, [videoUrl, isYouTubeVideo, onPlayerReady]);

  if (!videoUrl) return null;

  return (
    <Box
      sx={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        backgroundColor: '#000', overflow: 'hidden', zIndex: 1,
        '& .yt-container': { width: '100%', height: '100%' },
        '& iframe': { width: '100%', height: '100%', pointerEvents: 'none' }, // 'none' para que el clic lo reciba tu capa superior
      }}
    >
      {isYouTubeVideo ? (
        <YouTube
          videoId={youtubeVideoId}
          opts={youtubeOpts}
          className="yt-container"
          onReady={handleYouTubeReady}
          onStateChange={handleYouTubeStateChange}
          onError={(e) => console.error("❌ Error de YouTube:", e)}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          controls={false}
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}
    </Box>
  );
};

export default Videopopup;