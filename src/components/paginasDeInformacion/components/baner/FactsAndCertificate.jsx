import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material"; 

const FactsAndCertificate = ({
  certificateSubtitle,
  certificateLongDescription, 
  facts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <Box
        sx={{
          py: 8,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "flex-start",
          gap: { xs: 6, md: 8 },
          maxWidth: "lg",
          mx: "auto",
          px: { xs: 2, sm: 4 },
        }}
      >
        {/* Columna Izquierda: Certificado */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: "100%", md: "400px" },
            maxWidth: { xs: "100%", md: "50%" },
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom 
              sx={{ 
                mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: isExpanded ? "none" : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: { xs: "1.5rem", md: "2.125rem" },
                lineHeight: 1.3
              }}
            >
              {certificateSubtitle || "Certificado de Participación"}
            </Typography>
            <Button 
              onClick={() => setIsExpanded(!isExpanded)} 
              variant="text" 
              size="small"
              sx={{ 
                textTransform: "none", 
                p: 0, 
                fontWeight: "bold",
                color: "#F21C63",
                mb: 2,
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
              }}
            >
              {isExpanded ? "Ver menos" : "Ver más"}
            </Button>
          </Box>

          {certificateLongDescription && (
            <Typography variant="body1" paragraph sx={{ mb: 1.5 }}>
              {certificateLongDescription}
            </Typography>
          )}
        </Box>

        {/* Columna Derecha: Datos Clave (Facts) */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: "100%", md: "400px" },
            maxWidth: { xs: "100%", md: "50%" },
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            {facts.title}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",   
                sm: "1fr 1fr",
                md: "1fr 1fr",
              },
              gap: { xs: 3, sm: 4 },
            }}
          >
            {facts.items.map((fact, index) => (
              <Box
                key={index}
                sx={{
                  borderLeft: "4px solid #FFD700",
                  pl: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {fact.description}:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {fact.description === "Horas por semana" ? `${fact.value} horas` : fact.value}
                </Typography>
                {fact.source && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Fuente: {fact.source}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default FactsAndCertificate;