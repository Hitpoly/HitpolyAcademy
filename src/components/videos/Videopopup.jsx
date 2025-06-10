// Video.jsx
import React from 'react';
import { Box } from '@mui/material';

const Video = ({ videoUrl }) => {
  if (!videoUrl) {
    return null; // No renderizar si no hay URL de video
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '560px', // Ancho máximo para videos incrustados
        aspectRatio: '16 / 9', // Proporción 16:9 para videos
        backgroundColor: '#000', // Fondo negro mientras carga o si no hay video
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 1,
      }}
    >
      <video
        controls
        src={videoUrl}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        title="Video del curso"
      >
        Tu navegador no soporta el tag de video.
      </video>
    </Box>
  );
};

export default Video;