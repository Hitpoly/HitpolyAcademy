import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import CountdownTimer from "./components/HorizontalCountdown"; 
const CountdownBanner = ({ title, subtitle, targetDate, ctaText, ctaLink }) => {
  const [hasOfferEnded, setHasOfferEnded] = useState(false);

  useEffect(() => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      setHasOfferEnded(true);
    }
  }, [targetDate]);

  const handleCountdownEnd = () => {
    setHasOfferEnded(true);
  };

  if (hasOfferEnded) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "250px", 
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

  return (
    <Box
      sx={{
        width: "100%",
        maxHeight: "100%",
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
        overflow: "hidden",
        gap: { xs: 4, md: 2 },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
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