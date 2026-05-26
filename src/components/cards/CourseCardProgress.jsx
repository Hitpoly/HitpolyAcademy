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

        setShareTooltipText("Error al copiar"); // Muestra un mensaje de error si falla
        setTimeout(() => {
          setShareTooltipText("Copiar enlace del curso");
        }, 2000); // Más tiempo para leer el error
      });
  };

  return (
    <Card
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        borderRadius: "15px",
        boxShadow: "none",
        border: "1px solid #e0e0e0",
        overflow: "hidden",
        mb: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)"
        }
      }}
    >
      {/* Imagen del curso */}
      <CardMedia
        component="img"
        sx={{ 
          width: { xs: "100%", sm: 280 }, 
          height: { xs: 180, sm: "auto" },
          objectFit: "cover"
        }}
        image={curso.portada_targeta || "/images/default-course-thumbnail.jpg"}
        alt={curso.titulo}
      />

      {/* Contenido */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        flexGrow: 1, 
        p: { xs: 2, md: 3 },
        justifyContent: "center"
      }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#1c1d1f",
            fontSize: "1.1rem",
            mb: 0.5,
            lineHeight: 1.3
          }}
        >
          {curso.titulo}
        </Typography>
        
        <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: 'block' }}>
          Último acceso: Recientemente
        </Typography>

        {/* Barra de Progreso Minimalista */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              Progreso
            </Typography>
            <Typography variant="caption" fontWeight="bold" color="#6C4DE2">
              {curso.progreso}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={curso.progreso}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#f0f0f0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#6C4DE2",
                borderRadius: 3,
              }
            }}
          />
        </Box>

        {/* Botón Acción */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              bgcolor: "#6C4DE2",
              "&:hover": { bgcolor: "#5A3BBF" },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              px: 3,
              py: 0.8,
              fontSize: "0.9rem",
              boxShadow: "none"
            }}
            onClick={handleContinueClick}
          >
            Ir al aula
          </Button>

          <Tooltip title={shareTooltipText} placement="top">
            <IconButton onClick={handleShareClick} size="small">
              <ShareIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

export default CourseCardProgress;