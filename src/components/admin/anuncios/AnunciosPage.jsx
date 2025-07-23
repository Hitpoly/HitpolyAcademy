import React, { useState } from "react";
import { Box, AppBar, Toolbar, Typography, useTheme } from "@mui/material";
import AnuncioForm from "../../forms/CrearAnuncioForm";
import AnunciosList from "../../banners/AnunciosList";

function AnunciosPage() {
  const [refreshListTrigger, setRefreshListTrigger] = useState(0);
  const [anuncioToEdit, setAnuncioToEdit] = useState(null);
  const theme = useTheme();

  const handleAnuncioCreado = () => {
    setRefreshListTrigger((prev) => prev + 1);
    setAnuncioToEdit(null);
  };

  const handleAnuncioEditado = () => {
    setRefreshListTrigger((prev) => prev + 1);
    setAnuncioToEdit(null);
  };

  const handleEditAnuncio = (anuncio) => {
    setAnuncioToEdit(anuncio);
  };

  const handleCancelEdit = () => {
    setAnuncioToEdit(null);
  };

  return (
    <Box sx={{ height: "100%", p: 2 }}>
      <Box
        sx={{
          width: "100%",
          height: "calc(100vh - 65px)",
          [theme.breakpoints.down("sm")]: {
            display: "block",
            height: "auto",
          },
        }}
      >
        <Box
          sx={{
            width: "35%",
            height: "100%",
            float: "left",
            pr: 2,
            [theme.breakpoints.down("sm")]: {
              width: "100%",
              height: "auto",
              float: "none",
              pr: 0,
              mb: 3,
            },
          }}
        >
          <AnuncioForm
            onAnuncioCreado={handleAnuncioCreado}
            anuncioToEdit={anuncioToEdit}
            onAnuncioEditado={handleAnuncioEditado}
            onCancelEdit={handleCancelEdit}
          />
        </Box>
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
          <AnunciosList
            refreshTrigger={refreshListTrigger}
            onEditAnuncio={handleEditAnuncio}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default AnunciosPage;