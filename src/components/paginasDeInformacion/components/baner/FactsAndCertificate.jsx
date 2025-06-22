// src/pages/components/baner/FactsAndCertificate.jsx
import React from "react";
import { Box, Typography, Divider } from "@mui/material"; // Divider no se está usando, se puede quitar si no se planea usar.

const FactsAndCertificate = ({
  certificateSubtitle, // Nuevo prop para el subtítulo del certificado
  certificateLongDescription, // Nuevo prop para la descripción larga del certificado
  facts,
  brandingData
}) => {
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
        {/* Sección del Certificado */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: "100%", md: "400px" },
            maxWidth: { xs: "100%", md: "50%" },
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            {certificateSubtitle || "Certificado de Participación"}
          </Typography>

          {certificateLongDescription && (
            <Typography variant="body1" paragraph sx={{ mb: 1.5 }}>
              {certificateLongDescription}
            </Typography>
          )}

          {brandingData && brandingData.length > 0 ? (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
              <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                Reconocido por:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 2, sm: 3 },
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                {brandingData.map((brand, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                      minWidth: '60px',
                      maxWidth: '100px',
                      textAlign: 'center',
                    }}
                  >
                    {brand.logoUrl && (
                      <img src={brand.logoUrl} alt={brand.logoText} style={{ maxWidth: '60px', maxHeight: '40px', objectFit: 'contain' }} />
                    )}
                    <Typography variant="caption" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      {brand.logoText || "Marca"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            null
          )}
        </Box>

        {/* Sección de Datos Clave del Curso */}
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
          {/* CAMBIO CLAVE AQUÍ: Ajuste para las columnas */}
          <Box
            sx={{
              display: "grid", // Usamos CSS Grid para un control más preciso de las columnas
              gridTemplateColumns: {
                xs: "1fr",   // En pantallas extra pequeñas (teléfonos), 1 columna (cada item ocupa el 100% de ancho)
                sm: "1fr 1fr", // En pantallas pequeñas (teléfonos grandes/tablets), 2 columnas
                md: "1fr 1fr", // En pantallas medianas (escritorio), 2 columnas
              },
              gap: { xs: 3, sm: 4 }, // Espacio entre los elementos de la cuadrícula
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
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
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