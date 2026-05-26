import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
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
  Dialog,
} from "@mui/material";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VideoPlayerWithControls from "../videos/VideoPlayerWithControls"; // Asegúrate de que la ruta sea correcta

const CursoCard = ({
  id,
  title,
  subtitle,
  banner,
  accessLink = "",
  instructorName,
  rating,
  reviews,
  price,
  videoUrl,
  oferta, // Nueva prop para la oferta
  students, // Nueva prop para cantidad de alumnos
}) => {
  const [openVideo, setOpenVideo] = useState(false);
  const videoRef = useRef(null);

  const handleOpenVideo = (e) => {
    e.stopPropagation();
    setOpenVideo(true);
  };

  const handleCloseVideo = () => setOpenVideo(false);

  // Lógica de Precio y Oferta
  const originalPrice = parseFloat(price) || 0;
  let finalPrice = originalPrice;
  let hasOffer = false;
  let offerLabel = "";
  let expirationDate = null;

  if (oferta) {
    if (oferta.precio_oferta && parseFloat(oferta.precio_oferta) > 0) {
      finalPrice = parseFloat(oferta.precio_oferta);
      hasOffer = true;
      const discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
      offerLabel = `-${discount}%`;
    } else if (oferta.descuento && parseFloat(oferta.descuento) > 0) {
      const discountPercent = parseFloat(oferta.descuento);
      finalPrice = originalPrice - (originalPrice * (discountPercent / 100));
      hasOffer = true;
      offerLabel = `-${discountPercent}%`;
    }
    
    if (hasOffer && oferta.fecha_fin) {
      expirationDate = new Date(oferta.fecha_fin);
    }
  }

  return (
    <>
      {/* CARTA DEL CURSO EN EL GRID */}
      <Card
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": { transform: "translateY(-4px)" },
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* Badge de Oferta */}
        {hasOffer && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 2,
              bgcolor: "#f21c63",
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "0.75rem",
              boxShadow: "0 2px 8px rgba(242, 28, 99, 0.4)"
            }}
          >
            OFERTA {offerLabel}
          </Box>
        )}

        <Box 
          sx={{ position: "relative", cursor: videoUrl ? "pointer" : "default", }} 
          onClick={videoUrl ? handleOpenVideo : null}
        >
          {banner && (
            <CardMedia
              component="img"
              image={banner}
              alt={title}
              sx={{ 
                width: "100%",
                aspectRatio: "16/9",
                objectFit: "cover", 
                bgcolor: "#f0f0f0" 
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem", lineHeight: 1.2, height: "2.4em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", color: "#1c1d1f" }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {instructorName || "Instructor Academia"}
            </Typography>
          </Box>

          {/* Alumnos Inscritos - Arriba de las estrellas */}
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "medium", display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
            👥 {students || 0} inscritos
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#b4690e", mr: 0.5 }}>
              {rating || "0.0"}
            </Typography>
            <Rating value={parseFloat(rating) || 0} precision={0.1} readOnly size="small" sx={{ color: "#e59819" }} />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              ({reviews || 0})
            </Typography>
          </Box>

          <Box sx={{ mt: "auto" }}>
            {/* Sección de Precio y Botón de Reproducción en la misma altura */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                {hasOffer ? (
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#f21c63" }}>
                      ${finalPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ textDecoration: "line-through", color: "#999" }}>
                      ${originalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1c1d1f" }}>
                    {price}
                  </Typography>
                )}

                {/* Fecha de Expiración */}
                {expirationDate && (
                  <Typography variant="caption" sx={{ color: "#d32f2f", fontWeight: "bold", display: "block", mt: 0.5 }}>
                    ⏳ Esta oferta expira: {expirationDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </Typography>
                )}
              </Box>

              {videoUrl && (
                <Tooltip title="Reproducir Introducción">
                  <IconButton onClick={handleOpenVideo} size="small" sx={{ color: "#6F4CE0", mt: -0.5 }}>
                    <PlayCircleFilledWhiteIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Button
              component={Link}
              to={accessLink}
              variant="outlined"
              fullWidth
              sx={{ textTransform: "none", fontWeight: "bold", borderColor: "#1c1d1f", color: "#1c1d1f", borderRadius: "8px" }}
            >
              Ver más información
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* POPUP DE VIDEO (MODAL) */}
      <Dialog 
        open={openVideo} 
        onClose={handleCloseVideo} 
        maxWidth="md" 
        fullWidth 
        scroll="paper" // Importante: El scroll se maneja en el papel del diálogo
        PaperProps={{ 
          sx: { 
            borderRadius: "16px", 
            overflow: "hidden", 
            bgcolor: "#fff",
            position: "relative",
            maxHeight: "90vh" 
          } 
        }}
      >
        {/* Botón Cerrar: Posicionado absolutamente con espacio de las paredes */}
        <IconButton 
          onClick={handleCloseVideo}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            "&:hover": { bgcolor: "#f5f5f5" }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Contenedor con Scroll único para todo el contenido */}
        <Box sx={{ overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          {/* 1. Encabezado: Título y Subtítulo al 95% de ancho */}
          <Box sx={{ p: { xs: 3, md: 4 }, pr: 8 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800, 
                color: "#1c1d1f", 
                lineHeight: 1.3, 
                mb: 1.5,
                maxWidth: "95%",
                textAlign: "left"
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 400, 
                lineHeight: 1.6,
                maxWidth: "95%",
                textAlign: "left"
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          {/* 2. Video: Ocupa el ancho completo del modal */}
          <Box sx={{ width: "100%", bgcolor: "#000", lineHeight: 0 }}>
            {videoUrl ? (
              <VideoPlayerWithControls 
                ref={videoRef} 
                videoUrl={videoUrl} 
                onVideoCompleted={() => {}}
              />
            ) : (
              <Box sx={{ py: 10, textAlign: 'center', color: 'white' }}>
                <Typography>Video no disponible actualmente</Typography>
              </Box>
            )}
          </Box>

          {/* 3. Pie de página: Botón de Acceso */}
          <Box sx={{ p: 4, display: "flex", justifyContent: "flex-end", bgcolor: "#fff" }}>
            <Button
              component={Link}
              to={accessLink}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                borderRadius: "10px", 
                px: 5, 
                py: 2,
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1.1rem",
                bgcolor: "#6F4CE0",
                boxShadow: "0 4px 14px rgba(111, 76, 224, 0.3)",
                "&:hover": { 
                  bgcolor: "#5a3db1",
                  boxShadow: "0 6px 20px rgba(111, 76, 224, 0.4)"
                }
              }}
            >
              Acceder al curso ahora
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default CursoCard;