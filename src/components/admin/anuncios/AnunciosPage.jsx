import React, { useState } from "react";
import { Box, AppBar, Toolbar, Typography, useTheme } from "@mui/material";
import CrearAnuncioForm from "../../forms/CrearAnuncioForm";
import AnunciosList from "../../banners/AnunciosList";

function AnunciosPage() {
  const [refreshListTrigger, setRefreshListTrigger] = useState(0);
  const handleAnuncioCreado = () => setRefreshListTrigger((prev) => prev + 1);
  const theme = useTheme();

  return (
    <Box sx={{ height: "100%", p: 5}}>
      <Box
        sx={{
          width: "100%",
          height: "calc(100vh - 64px)",
          mt: 2,
          [theme.breakpoints.down("sm")]: {
            display: "block", // En móviles, una columna debajo de la otra
            height: "auto",
          },
        }}
      >
        {/* Columna Izquierda */}
        <Box
          sx={{
            width: "35%",
            height: "100%",
            float: "left",
            [theme.breakpoints.down("sm")]: {
              width: "100%",
              height: "auto",
              float: "none",
            },
          }}
        >
          <CrearAnuncioForm onAnuncioCreado={handleAnuncioCreado} />
        </Box>

        {/* Columna Derecha */}
        <Box
          sx={{
            width: "65%",
            height: "100%",
            float: "left",
            [theme.breakpoints.down("sm")]: {
              width: "100%",
              height: "auto",
              float: "none",
            },
          }}
        >
          <AnunciosList refreshTrigger={refreshListTrigger} />
        </Box>
      </Box>
    </Box>
  );
}

export default AnunciosPage;
