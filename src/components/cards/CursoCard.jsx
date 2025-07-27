import React, { useState } from "react"; // Importar useState

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  Tooltip,
  IconButton,
} from "@mui/material";

import ShareIcon from "@mui/icons-material/Share";

const CursoCard = ({
  title,
  subtitle,
  banner,
  accessLink,
  instructorName,
  rating,
  reviews,
  students,
  totalHours,
  price,
  level,
}) => {
  // Estado para controlar el texto del tooltip del botón de compartir
  const [shareTooltipText, setShareTooltipText] = useState("Copiar enlace del curso");

  // Función para convertir el título en un slug amigable para URL
  const slugify = (text) => {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");
  };

  // Extraer el ID del curso de accessLink, asumiendo que es el último segmento numérico
  const courseId = accessLink.split("/").pop();

  // Construir el enlace de compartir con el título slugificado y el ID
  const shareLink = `https://academy.hitpoly.com/curso/${slugify(title)}-${courseId}`;

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
        width: 300,
        minWidth: 200,
        maxWidth: 300,
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
      {banner && (
        <CardMedia
          component="img"
          height="140"
          image={banner}
          alt={title}
          sx={{ objectFit: "cover" }}
        />
      )}

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
        <Box>
          <Tooltip title={title} placement="top">
            <Typography
              gutterBottom
              variant="h6"
              component="div"
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
              {title}
            </Typography>
          </Tooltip>

          {instructorName && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, fontSize: "0.8rem" }}
            >
              {instructorName}
            </Typography>
          )}

          {subtitle && (
            <Tooltip title={subtitle} placement="bottom">
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
                {subtitle}
              </Typography>
            </Tooltip>
          )}

          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            {rating && (
              <Typography
                variant="body2"
                color="orange"
                sx={{ fontWeight: "bold", mr: 0.5, fontSize: "0.9rem" }}
              >
                {rating}
              </Typography>
            )}
            {rating && (
              <Rating
                name="read-only"
                value={parseFloat(rating)}
                precision={0.1}
                readOnly
                size="small"
                sx={{ color: "#e59819" }}
              />
            )}
            {reviews && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 0.5, fontSize: "0.8rem" }}
              >
                ({reviews})
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            {students && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.8rem", mr: 1, whiteSpace: "nowrap" }}
              >
                {students} estudiantes
              </Typography>
            )}
            {totalHours && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.8rem", mr: 1, whiteSpace: "nowrap" }}
              >
                {totalHours}
              </Typography>
            )}
            {level && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: "0.8rem",
                  ml: students || totalHours ? 0.5 : 0,
                  border: "1px solid #d1d7dc",
                  borderRadius: "3px",
                  px: 0.5,
                  py: 0.2,
                  whiteSpace: "nowrap",
                }}
              >
                {level}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            pt: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              mb: 1,
            }}
          >
            {price && (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: "bold",
                  color: "#1c1d1f",
                  fontSize: "1.2rem",
                }}
              >
                {price}
              </Typography>
            )}
            {/* El Tooltip ahora usa el estado shareTooltipText */}
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
          <Button
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: "transparent",
              color: "#1c1d1f",
              borderColor: "#1c1d1f",
              padding: "8px 16px",
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: "bold",
              width: "100%",
              "&:hover": {
                backgroundColor: "#f7f9fa",
                borderColor: "#1c1d1f",
              },
            }}
            href={accessLink}
          >
            Ver más información
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CursoCard;