import React from 'react';
import { Box, Typography } from '@mui/material';

// Función auxiliar para extraer el ID de video de YouTube
const getYouTubeVideoId = (url) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url?.match(regExp);
  return (match && match[1]) ? match[1] : null;
};

const CourseVideo = ({ videoUrl }) => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <Box sx={{
        width: '100%',
        paddingTop: '56.25%',
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

  const embedUrl = `https://www.youtube.com/embed/${videoId}`; 

  return (
    <Box sx={{
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      overflow: 'hidden',
      borderRadius: 2,
      '& iframe': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0,
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