// src/components/videos/Videopopup.jsx
import React, { useRef, useEffect, useCallback } from 'react'; // Agregamos useCallback
import { Box } from '@mui/material';
import YouTube from 'react-youtube';

const getYouTubeVideoId = (url) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\s&]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url?.match(regExp);
  return match && match[1] ? match[1] : null;
};

const Videopopup = ({ videoUrl, onPlayerReady }) => {
  const videoRef = useRef(null); // Para el elemento <video> nativo
  // El `youtubePlayerRef` ya no es estrictamente necesario aquí si `onPlayerReady` maneja la instancia.
  // const youtubePlayerRef = useRef(null); // Para la instancia de YouTube (event.target)

  // Determinamos el tipo de video fuera de los Hooks, antes de cualquier lógica condicional importante.
  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const isYouTubeVideo = !!youtubeVideoId;

  // Opciones para el reproductor de YouTube
  const youtubeOpts = {
    playerVars: {
      autoplay: 0,
      controls: 0, // Deshabilitamos los controles nativos de YouTube
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
    pointerEvents: 'none', // Aseguramos que los clicks pasen al overlay en VideoPlayerWithControls
  };

  // Manejador para cuando el reproductor de YouTube está listo
  const handleYouTubeReady = useCallback((event) => {
    // youtubePlayerRef.current = event.target; // No es necesario si solo lo pasamos
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  }, [onPlayerReady]); // Dependencia onPlayerReady

  // Este useEffect siempre se llama, y la lógica interna se bifurca.
  useEffect(() => {
    if (!videoUrl) return; // Si no hay URL, no hacemos nada.

    // Reiniciar la referencia del video HTML si la URL cambia o el tipo de video
    // (para evitar que se intente inicializar un player nativo si pasamos a YT)
    if (videoRef.current && isYouTubeVideo) {
      videoRef.current.src = ""; // Limpiar src para asegurar que no haya un player fantasma
      // No necesitamos `videoRef.current = null;` directamente porque useRef devuelve un objeto mutable.
    }

    if (!isYouTubeVideo) { // Si NO es un video de YouTube, inicializamos el HTML video
      if (videoRef.current) {
        if (onPlayerReady) {
          onPlayerReady(videoRef.current);
        }
      }
    }
    // Para YouTube, `onPlayerReady` se llama desde `handleYouTubeReady` cuando el componente `YouTube` está listo.

    // Función de limpieza para HTML video si se desmonta o cambia a YouTube
    return () => {
      if (videoRef.current && !isYouTubeVideo) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src'); // Evita errores de red en la consola
        videoRef.current.load();
      }
      // La limpieza de YouTube la maneja el propio componente `react-youtube` al desmontar
    };
  }, [videoUrl, isYouTubeVideo, onPlayerReady]); // Dependencias esenciales

  if (!videoUrl) return null; // Salida temprana si no hay URL

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: '#000',
        borderRadius: 1,
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
          onReady={handleYouTubeReady} // Usamos el manejador useCallback
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          controls={false} // Deshabilitamos los controles nativos
          style={{ ...fillParentStyles, objectFit: 'contain' }}
          title="Video del curso"
        />
      )}
    </Box>
  );
};

export default Videopopup;