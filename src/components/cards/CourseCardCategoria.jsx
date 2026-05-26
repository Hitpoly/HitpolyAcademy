// components/CourseCard.jsx
import React, { useState } from 'react'; // Importar useState
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Tooltip,      // Importar Tooltip
  IconButton    // Importar IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShareIcon from "@mui/icons-material/Share"; // Importar el icono de compartir

const CourseCard = ({ course, categoryName }) => {
  const navigate = useNavigate();

  // Estado para controlar el texto del tooltip del botón de compartir
  const [shareTooltipText, setShareTooltipText] = useState("Copiar enlace del curso");

  // Función para convertir el título en un slug amigable para URL
  const slugify = (text) => {
    return text
      .toString()
      .normalize("NFD") // Normaliza diacríticos (ej. é -> e)
      .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos
      .toLowerCase() // Convierte a minúsculas
      .trim() // Elimina espacios en blanco al principio y al final
      .replace(/\s+/g, "-") // Reemplaza espacios con guiones
      .replace(/[^\w-]+/g, "") // Elimina caracteres no alfanuméricos excepto guiones
      .replace(/--+/g, "-"); // Reemplaza múltiples guiones con uno solo
  };

  // Construir el enlace de compartir con el título slugificado y el ID
  // El dominio se mantiene como https://academy.hitpoly.com/
  const shareLink = `https://academy.hitpoly.com/curso/${slugify(course.titulo)}-${course.id}`;

  const handleCardClick = () => {
    navigate(`/curso/${course.id}`);
  };

  // Helper para el precio con oferta
  let priceDisplay = `Precio: $${course.precio || 'N/A'}`;
  if (course.oferta && course.precio) {
    const originalPrice = parseFloat(course.precio);
    if (!isNaN(originalPrice)) {
      if (course.oferta.precio_oferta && parseFloat(course.oferta.precio_oferta) > 0) {
        priceDisplay = (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ textDecoration: "line-through", color: "#888", fontSize: "0.85rem", fontWeight: "normal" }}>${originalPrice}</span>
            <span style={{ color: "#F21C63", fontWeight: "bold" }}>${course.oferta.precio_oferta}</span>
          </Box>
        );
      } else if (course.oferta.descuento && parseFloat(course.oferta.descuento) > 0) {
        const newPrice = originalPrice - (originalPrice * (course.oferta.descuento / 100));
        priceDisplay = (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ textDecoration: "line-through", color: "#888", fontSize: "0.85rem", fontWeight: "normal" }}>${originalPrice}</span>
            <span style={{ color: "#F21C63", fontWeight: "bold" }}>${newPrice.toFixed(2)} (-{course.oferta.descuento}%)</span>
          </Box>
        );
      }
    }
  }

  const handleShareClick = (event) => {
    event.stopPropagation(); // Evita que el clic en el botón de compartir active el handleCardClick de CardActionArea
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setShareTooltipText("¡Copiado!"); // Cambia el texto del tooltip a "Copiado"
        setTimeout(() => {
          setShareTooltipText("Copiar enlace del curso"); // Vuelve al texto original después de un tiempo
        }, 1500); // 1.5 segundos
      })
      .catch((err) => {

        setShareTooltipText("Error al copiar"); // Muestra un mensaje de error si falla
        setTimeout(() => {
          setShareTooltipText("Copiar enlace del curso");
        }, 2000); // Más tiempo para leer el error
      });
  };

  return (
    <Card sx={{ maxWidth: 345, width: '100%', m: 2, boxShadow: 3, position: 'relative' }}> {/* Añadir position: 'relative' para posicionamiento futuro si se necesita */}
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="140"
          image={course.imagen || course.portada_targeta || "https://via.placeholder.com/345x140?text=Curso+Imagen"}
          alt={course.titulo}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 1, minHeight: '3em' }}>
            {course.titulo.length > 50 ? course.titulo.substring(0, 50) + "..." : course.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: '2em', mb: 1 }}>
            {course.subtitulo ? (course.subtitulo.length > 60 ? course.subtitulo.substring(0, 60) + "..." : course.subtitulo) : "Aprende de los mejores profesionales."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            **Categoría:** {categoryName}
          </Typography>
          <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold', mt: 1 }}>
            {priceDisplay}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> {/* Ajustar para alinear el botón y el icono */}
        <Button
          variant="contained"
          color="primary"
          sx={{ flexGrow: 1, mr: 1 }} // El botón ocupa la mayor parte del espacio
          onClick={handleCardClick}
        >
          Ver Curso
        </Button>
        <Tooltip title={shareTooltipText} placement="top">
          <IconButton
            aria-label="compartir"
            onClick={handleShareClick}
            sx={{ color: "#1c1d1f" }}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default CourseCard;