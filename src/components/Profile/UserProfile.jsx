// src/components/UserProfile.jsx
import React from "react";
import { Box, useMediaQuery, useTheme, Typography } from "@mui/material";
import ProfileInfoSection from "./components/ProfileInfoSection";
import InProgressCoursesSection from "./components/InProgressCoursesSection";

const UserProfile = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

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
      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: profileColumnWidth },
          minWidth: { md: profileColumnWidth },
          position: isSmallScreen ? "static" : "fixed",
          top: isSmallScreen ? "auto" : "65px",
          left: 0,
          height: isSmallScreen ? "auto" : "calc(100vh - 65px)", 
          overflowY: "auto",
          borderRadius: { xs: 2, md: 0 },
          p: { xs: 2, md: 3 },
          zIndex: 1000,
          mx: isSmallScreen ? "auto" : 0,
          order: isSmallScreen ? 1 : 0, 
        }}
      >
        <ProfileInfoSection />
      </Box>

      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: rightColumnWidth },
          backgroundColor: "#eef2f6",
          flexShrink: 0,
          p: { xs: 2, md: 3 },
          height: isSmallScreen ? "auto" : "calc(100vh - 65px)",
          overflowY: "auto",
          mx: isSmallScreen ? "auto" : 0,
          mb: { xs: 3, md: 0 },
          position: isSmallScreen ? "static" : "fixed",
          top: isSmallScreen ? "auto" : "65px",
          right: 0,
          zIndex: 999,
          order: isSmallScreen ? 2 : 0, 
        }}
      >
        <Typography variant="h6" gutterBottom>
          Certificaciones Adquiridas
        </Typography>
        <Typography variant="body2">
          Aún no has ganado ningún certificado.
        </Typography>
      </Box>

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
          order: isSmallScreen ? 3 : 0, 
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: { xs: 2, md: 0 },
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