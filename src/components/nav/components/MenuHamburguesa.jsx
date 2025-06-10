import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const nombres = [
  "Juan Pérez",
  "Ana Torres",
  "Luis Fernández",
  "María Gómez",
  "Carlos Sánchez",
  "Valeria Ríos",
  "Sofía León",
  "Miguel Vargas",
];

const ListaDeNombres = () => {
  return (
    <Box
      sx={{
        width: 250,
        padding: 2,
        overflowY: "auto",
        backgroundColor: "#fff",
        height: "100vh",
        position: "relative",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Lista de Nombres
      </Typography>
      <List>
        {nombres.map((nombre, index) => (
          <ListItem key={index} disableGutters>
            <ListItemText primary={nombre} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ListaDeNombres;
