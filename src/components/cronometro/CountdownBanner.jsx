import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import CountdownTimer from "./components/HorizontalCountdown"; // Asegúrate que la ruta sea correcta

const CountdownBanner = ({ title, subtitle, targetDate, ctaText, ctaLink }) => {
  const [hasOfferEnded, setHasOfferEnded] = useState(false);

  useEffect(() => {
    // Calcula la diferencia de tiempo para determinar si la oferta ha terminado.
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      setHasOfferEnded(true);
    }
  }, [targetDate]);

  const handleCountdownEnd = () => {
    setHasOfferEnded(true);
  };

  if (hasOfferEnded) {
    // Contenido del banner cuando la oferta ha terminado
    return (
      <Box
        sx={{
          width: "100%", // Ocupa el 100% del ancho de su padre
          minHeight: "250px", // Altura mínima para el contenido
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4, // Padding alrededor del contenido
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)", // Fondo degradado
          color: "white", // Color del texto
          boxShadow: "0px 10px 20px rgba(0,0,0,0.5)", // Sombra para profundidad
          borderRadius: 2, // Bordes redondeados
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {title}
        </Typography>
        <Typography variant="h5" sx={{ mt: 2 }}>
          ¡La oferta ha terminado!
        </Typography>
        {ctaText && ctaLink && (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              mt: 4,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              fontSize: "1.1rem",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            {ctaText}
          </Button>
        )}
      </Box>
    );
  }

  // Contenido del banner cuando la oferta está activa
  return (
    <Box
      sx={{
        width: "100%", // Ocupa el 100% del ancho de su padre
        maxHeight: "100%", // Asegura que no se desborde verticalmente
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        color: "white",
        boxShadow: "0px 10px 20px rgba(0,0,0,0.5)",
        borderRadius: 2,
        overflow: "hidden", // Recorta el contenido si excede el tamaño
        gap: { xs: 4, md: 2 }, // Espacio entre los elementos internos
      }}
    >
      <Box
        sx={{
          flexShrink: 0, // Evita que este elemento se encoja
          mb: { xs: 4, md: 0 },
        }}
      >
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {title}
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: "400px", mx: "auto" }}>
          {subtitle}
        </Typography>
      </Box>

      <CountdownTimer
        targetDate={targetDate}
        onCountdownEnd={handleCountdownEnd}
      />
      <Button
        variant="contained"
        color="secondary"
        size="large"
        href={ctaLink}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          mt: 4,
          px: 4,
          py: 1.5,
          borderRadius: 3,
          fontWeight: "bold",
          fontSize: "1.1rem",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0px 6px 15px rgba(0,0,0,0.4)",
          },
        }}
      >
        {ctaText}
      </Button>
    </Box>
  );
};

export default CountdownBanner;