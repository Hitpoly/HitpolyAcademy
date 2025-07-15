// src/components/UserProfile.jsx
import React from "react";
import { Box, useMediaQuery, useTheme, Typography } from "@mui/material";
import ProfileInfoSection from "./components/ProfileInfoSection";
import InProgressCoursesSection from "./components/InProgressCoursesSection";

const UserProfile = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // isSmallScreen es true para tamaños 'md' o menores

  const profileColumnWidth = "400px";
  const rightColumnWidth = "400px";

  return (
    <Box
      sx={{
        backgroundColor: "#eef2f6",
        minHeight: "100vh",
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        alignItems: isSmallScreen ? "center" : "flex-start",
        justifyContent: isSmallScreen ? "flex-start" : "flex-start",
        pt: { xs: 2, md: 0 },
      }}
    >
      {/* Sección del Perfil (Columna Izquierda Fija con Scroll Independiente) */}
      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: profileColumnWidth },
          minWidth: { md: profileColumnWidth },
          position: isSmallScreen ? "static" : "fixed",
          top: isSmallScreen ? "auto" : "65px",
          left: 0,
          height: isSmallScreen ? "auto" : "calc(100vh - 65px)", // Ya tiene scroll independiente
          overflowY: "auto",
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          borderRadius: { xs: 2, md: 0 },
          p: { xs: 2, md: 3 },
          mb: { xs: 3, md: 0 },
          zIndex: 1000,
          mx: isSmallScreen ? "auto" : 0,
          order: isSmallScreen ? 1 : 0, // En móvil, es el primer elemento (orden 1)
        }}
      >
        <ProfileInfoSection />
      </Box>

      {/* Nueva Caja a la Derecha (Tercera Columna Fija con Scroll Independiente) */}
      {/* MODIFICACIÓN: Su posición en el DOM ahora está entre el perfil y el contenido central,
          pero su "order" controla su visualización en pantallas pequeñas. */}
      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: rightColumnWidth },
          backgroundColor: "white",
          flexShrink: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          p: { xs: 2, md: 3 },
          height: isSmallScreen ? "auto" : "calc(100vh - 65px)",
          overflowY: "auto",
          mx: isSmallScreen ? "auto" : 0,
          mb: { xs: 3, md: 0 },
          position: isSmallScreen ? "static" : "fixed",
          top: isSmallScreen ? "auto" : "65px",
          right: 0,
          zIndex: 999,
          order: isSmallScreen ? 2 : 0, // En móvil, es el segundo elemento (orden 2)
        }}
      >
        <Typography variant="h6" gutterBottom>
          Certificaciones Adquiridas
        </Typography>
        <Typography variant="body2">
          Aún no has ganado ningún certificado.
        </Typography>
      </Box>

      {/* Contenedor Único para el Contenido Central (que irá "detrás" de los laterales) */}
      <Box
        sx={{
          flexGrow: 1,
          ml: isSmallScreen ? 0 : profileColumnWidth,
          width: isSmallScreen ? "100%" : `calc(100% - ${profileColumnWidth})`,
          padding: {
            xs: 0,
            md: `0 ${rightColumnWidth} 0 0`,
            lg: `0 ${rightColumnWidth} 0 0`,
          },
          minHeight: "100vh",
          mt: { xs: 0, md: "0px" },
          backgroundColor: "#eef2f6",
          order: isSmallScreen ? 3 : 0, // En móvil, es el tercer elemento (orden 3)
        }}
      >
        {/* Sección de Cursos en Progreso (Columna Central que genera el Scroll Principal) */}
        <Box
          sx={{
            width: "100%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
            p: { xs: 2, md: 3 },
            mb: { xs: 3, md: 0 },
            mx: isSmallScreen ? "auto" : 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <InProgressCoursesSection />
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;