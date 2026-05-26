import React from "react";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";

export const LoadingView = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
    <CircularProgress />
    <Typography variant="h6" sx={{ mt: 2 }}>Cargando información del curso...</Typography>
  </Box>
);

export const ErrorView = ({ message }) => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <Alert severity="error" sx={{ m: 2 }}>{message}</Alert>
  </Box>
);

export const NotFoundView = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <Alert severity="warning">No se pudo cargar la información del curso. ID no válido o inexistente.</Alert>
  </Box>
);