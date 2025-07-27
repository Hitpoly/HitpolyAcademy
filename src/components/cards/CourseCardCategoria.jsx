// components/CourseCard.jsx
import React from 'react';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton, // Importar IconButton
  Tooltip // Importar Tooltip
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share'; // Importar el icono de compartir
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, categoryName }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/curso/${course.id}`);
  };

  // Enlace para compartir el curso
  const shareLink = `http://localhost:3000/curso/${course.id}`;

  const handleShareClick = (event) => {
    event.stopPropagation(); // Evita que el clic en el botón de compartir active el handleCardClick
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        alert("Enlace del curso copiado al portapapeles.");
      })
      .catch((err) => {
        console.error("Error al copiar el enlace: ", err);
      });
  };

  return (
    <Card sx={{ maxWidth: 345, width: '100%', m: 2, boxShadow: 3 }}>
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="140"
          image={course.imagen || "https://via.placeholder.com/345x140?text=Curso+Imagen"}
          alt={course.titulo}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {course.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {course.subtitulo || "Sin subtítulo."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            **Categoría:** {categoryName}
          </Typography>
          <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold', mt: 1 }}>
            Precio: ${course.precio || 'N/A'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ flexGrow: 1, mr: 1 }} // El botón ocupa el espacio restante
          onClick={handleCardClick}
        >
          Ver Curso
        </Button>
        <Tooltip title="Compartir curso" placement="top">
          <IconButton
            aria-label="compartir"
            onClick={handleShareClick}
            sx={{ color: '#1c1d1f' }}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default CourseCard;