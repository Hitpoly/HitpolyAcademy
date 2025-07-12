import React, { useState } from "react";
import { Box, AppBar, Toolbar, Typography, useTheme } from "@mui/material";
import AnuncioForm from "../../forms/CrearAnuncioForm";
import AnunciosList from "../../banners/AnunciosList";

function AnunciosPage() {
  const [refreshListTrigger, setRefreshListTrigger] = useState(0);
  const [anuncioToEdit, setAnuncioToEdit] = useState(null); // Estado para el anuncio a editar
  const theme = useTheme();

  const handleAnuncioCreado = () => {
    setRefreshListTrigger((prev) => prev + 1);
    setAnuncioToEdit(null); // Limpiar el formulario después de crear
  };

  const handleAnuncioEditado = () => {
    setRefreshListTrigger((prev) => prev + 1);
    setAnuncioToEdit(null); // Limpiar el formulario después de editar
  };

  const handleEditAnuncio = (anuncio) => {
    setAnuncioToEdit(anuncio); // Establecer el anuncio que se va a editar
  };

  // ✨ Nueva función para cancelar la edición ✨
  const handleCancelEdit = () => {
    setAnuncioToEdit(null); // Esto hará que AnuncioForm se limpie y vuelva al modo de creación
  };

  return (
    <Box sx={{ height: "100%", p: 5}}>
      <Box
        sx={{
          width: "100%",
          height: "calc(100vh - 65px)",
          mt: 2,
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
            [theme.breakpoints.down("sm")]: {
              width: "100%",
              height: "auto",
              float: "none",
            },
          }}
        >
          <AnuncioForm
            onAnuncioCreado={handleAnuncioCreado}
            anuncioToEdit={anuncioToEdit}
            onAnuncioEditado={handleAnuncioEditado}
            // ✨ Pasar la nueva función como prop ✨
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