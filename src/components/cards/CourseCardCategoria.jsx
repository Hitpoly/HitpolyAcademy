// components/CourseCard.jsx
import React from 'react';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, categoryName }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/curso/${course.id}`);
  };

  return (
    <Card sx={{ maxWidth: 345, width: '100%', m: 2, boxShadow: 3 }}>
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="140"
          // Puedes reemplazar esta URL con la imagen real del curso si la tienes
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
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCardClick}
        >
          Ver Curso
        </Button>
      </Box>
    </Card>
  );
};

export default CourseCard;