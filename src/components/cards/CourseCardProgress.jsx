import React, { useState } from "react"; // Importar useState para el estado del tooltip
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardMedia,
  CardContent,
  Button,
  Tooltip, // Importar Tooltip
  IconButton, // Importar IconButton
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShareIcon from "@mui/icons-material/Share"; // Importar el icono de compartir
import { useNavigate } from "react-router-dom";

const CourseCardProgress = ({ curso }) => {
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

  // Extraer el ID del curso del objeto curso
  // Asumimos que `curso.id` ya contiene el ID necesario
  const courseId = curso.id;

  // Construir el enlace de compartir con el título slugificado y el ID
  // Se ha actualizado el dominio a https://academy.hitpoly.com/
  const shareLink = `https://academy.hitpoly.com/curso/${slugify(curso.titulo)}-${courseId}`;

  // Función para manejar el clic en el botón "Continuar"
  const handleContinueClick = () => {
    // Navega a la ruta del curso, usando el ID del curso
    navigate(`/master-full/${curso.id}`);
  };

  // Función para manejar el clic en el botón de compartir
  const handleShareClick = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setShareTooltipText("¡Copiado!"); // Cambia el texto del tooltip a "Copiado"
        setTimeout(() => {
          setShareTooltipText("Copiar enlace del curso"); // Vuelve al texto original después de un tiempo
        }, 1500); // 1.5 segundos
      })
      .catch((err) => {
        console.error("Error al copiar el enlace: ", err);
        setShareTooltipText("Error al copiar"); // Muestra un mensaje de error si falla
        setTimeout(() => {
          setShareTooltipText("Copiar enlace del curso");
        }, 2000); // Más tiempo para leer el error
      });
  };

  return (
    <Card
      sx={{
        width: {xs: "100%", md: 500},
        minWidth: 250,
        maxWidth: {xs: "100%", md: 500},
        height: "auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
        },
        overflow: "hidden",
      }}
    >
      {/* Sección de la imagen del curso */}
      <CardMedia
        component="img"
        sx={{ objectFit: "cover" }}
        // Usa la portada_targeta del curso o una imagen por defecto
        image={curso.portada_targeta || "/images/default-course-thumbnail.jpg"}
        alt={curso.titulo} // Texto alternativo para accesibilidad
      />

      {/* Contenido principal de la tarjeta */}
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "12px",
            paddingBottom: "12px !important",
          }}
        >
          {/* Título del curso */}
          <Typography
            component="div"
            gutterBottom
            variant="h6"
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: "1.3em",
              minHeight: "2.6em",
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "1.05rem" },
              mb: 0.5,
              color: "#1c1d1f",
            }}
          >
            {curso.titulo}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.4,
              minHeight: "2.8em",
              fontSize: "0.85rem",
              mb: 1,
            }}
          >
            {curso.subtitulo}
          </Typography>

          {/* Barra de progreso */}
          <LinearProgress
            variant="determinate"
            value={curso.progreso} // El valor del progreso (0-100)
            sx={{
              height: 8, // Grosor de la barra
              borderRadius: 5, // Bordes redondeados para la barra
              backgroundColor: "#e0e0e0", // Color de fondo de la barra
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#6C4DE2", // Color de la barra de progreso
              },
              mb: 1, // Margen inferior
            }}
          />
          {/* Texto del porcentaje completado */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "right" }}
          >
            **{curso.progreso}%** completado
          </Typography>
        </CardContent>

        {/* Sección del botón "Continuar" y compartir */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between", // Para alinear el botón y el icono
            alignItems: "center",
            p: 1.5,
            pl: 2,
            bgcolor: "#f9f9f9",
          }}
        >
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />} // Icono de reproducción
            sx={{
              bgcolor: "#6C4DE2", // Color de fondo del botón
              "&:hover": { bgcolor: "#5A3BBF" }, // Color de fondo al pasar el ratón
              borderRadius: 2, // Bordes redondeados para el botón
              px: 2, // Padding horizontal
              py: 0.8, // Padding vertical
              textTransform: "none", // Evita que el texto sea todo mayúsculas
            }}
            onClick={handleContinueClick} // Manejador de clic
          >
            Continuar
          </Button>

          {/* Botón de compartir con Tooltip dinámico */}
          <Tooltip title={shareTooltipText} placement="top">
            <IconButton
              aria-label="compartir"
              onClick={handleShareClick}
              sx={{ color: "#1c1d1f" }} // Asegura que el icono sea visible
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

export default CourseCardProgress;