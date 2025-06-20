// Videopopup.jsx
import React from 'react';
import { Box } from '@mui/material';
import YouTube from 'react-youtube';

const getYouTubeVideoId = (url) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url?.match(regExp);
  return match && match[1] ? match[1] : null;
};

const Videopopup = ({ videoUrl, onPlayerReady }) => {
  if (!videoUrl) return null;

  const youtubeVideoId = getYouTubeVideoId(videoUrl);

  const youtubeOpts = {
    playerVars: {
      autoplay: 0,
      controls: 0,         // IMPRESCINDIBLE: OCULTA LOS CONTROLES NATIVOS DE YOUTUBE
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
      // showinfo: 0,      // Este parámetro está obsoleto y no tiene efecto
    },
  };

  const fillParentStyles = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    border: 0,
  };

  const handleOnReady = (event) => {
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: '#000',
        borderRadius: 1,
        overflow: 'hidden',
        // Asegura que cualquier iframe dentro se ajuste correctamente
        '& iframe': {
          ...fillParentStyles,
        },
      }}
      // El onContextMenu aquí es menos necesario ya que la capa superior lo manejará
      // onContextMenu={(e) => e.preventDefault()} 
    >
      {youtubeVideoId ? (
        <YouTube
          videoId={youtubeVideoId}
          opts={youtubeOpts}
          className="yt-player"
          style={fillParentStyles}
          onReady={handleOnReady}
        />
      ) : (
        <video
          // Para videos locales, también deberías quitar 'controls' si quieres controles externos
          // y añadir el onContextMenu al video si no hay una capa superior.
          // controls
          src={videoUrl}
          style={{ ...fillParentStyles, objectFit: 'contain' }}
          title="Video del curso"
        />
      )}

      {/* --- NUEVA CAPA TRANSPARENTE ENCIMA DEL VIDEO --- */}
      <Box
        sx={{
          ...fillParentStyles, // Ocupa todo el espacio del padre
          zIndex: 1,           // Asegura que esté por encima del video (iframe/video)
          backgroundColor: 'transparent', // Totalmente transparente
          cursor: 'default',   // Cambia el cursor para no indicar interactividad
          // Intercepta eventos de ratón para evitar que lleguen al iframe
          pointerEvents: 'auto', // Asegura que reciba eventos de puntero
        }}
        onContextMenu={(e) => e.preventDefault()} // Deshabilita el clic derecho en esta capa
        // Puedes añadir más manejadores aquí si necesitas interceptar clics, etc.
        onClick={(e) => e.preventDefault()} // Opcional: intercepta clics normales
        onDoubleClick={(e) => e.preventDefault()} // Opcional: intercepta doble clics
      />
      {/* --- FIN NUEVA CAPA TRANSPARENTE --- */}
    </Box>
  );
};

export default Videopopup;