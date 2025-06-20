import React from 'react';
import { Box, Typography } from '@mui/material';

// Función auxiliar para extraer el ID de video de YouTube
const getYouTubeVideoId = (url) => {
  // Expresión regular robusta para capturar el ID de diferentes formatos de URL de YouTube
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url?.match(regExp);
  return (match && match[1]) ? match[1] : null;
};

const CourseVideo = ({ videoUrl }) => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    // Si no hay videoId válido, renderiza un placeholder o mensaje
    return (
      <Box sx={{
        width: '100%',
        paddingTop: '56.25%', // 16:9 aspect ratio
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#666',
        borderRadius: 2
      }}>
        <Typography variant="body1">Video no disponible o URL incorrecta.</Typography>
      </Box>
    );
  }

  // ¡IMPORTANTE! Asegúrate de usar la URL de embed correcta para YouTube
  const embedUrl = `https://www.youtube.com/embed/${videoId}`; // ¡Esta es la corrección clave!

  return (
    <Box sx={{
      position: 'relative',
      paddingBottom: '56.25%', // 16:9 Aspect Ratio
      height: 0,
      overflow: 'hidden',
      borderRadius: 2, // Aplica bordes redondeados al contenedor
      '& iframe': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0, // Remueve el borde predeterminado del iframe
      },
    }}>
      <iframe
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video de Introducción al Curso"
      ></iframe>
    </Box>
  );
};

export default CourseVideo;