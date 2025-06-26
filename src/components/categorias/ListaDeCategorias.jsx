// components/categorias/ListaDeCategorias.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

const CATEGORIES_STORAGE_KEY = "cachedCategories";
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24;

const ListaDeCategorias = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... (tu código existente de fetchDataForSearch) ...
  }, []);

  const handleCategoryClick = (categoryId) => {
    console.log("LOG - ListaDeCategorias: Clic en categoría. ID:", categoryId); // LOG 1
    if (onSelectCategory) {
      onSelectCategory(categoryId); // Llama a la función pasada por props desde MenuDeNavegacion
      console.log("LOG - ListaDeCategorias: onSelectCategory llamada."); // LOG 2
    } else {
      console.log("LOG - ListaDeCategorias: onSelectCategory NO está definida."); // LOG 3 (esto sería un problema)
    }
  };

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
        Categorías de Cursos
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          No se pudieron cargar las categorías: {error}
        </Alert>
      ) : (
        <List>
          <ListItem button onClick={() => handleCategoryClick(null)}>
            <ListItemText primary="Todas las Categorías" />
          </ListItem>
          <Divider component="li" />

          {categories.length > 0 ? (
            categories.map((categoria, index) => (
              <React.Fragment key={categoria.id}>
                <ListItem button onClick={() => handleCategoryClick(categoria.id)}>
                  <ListItemText primary={categoria.nombre} />
                </ListItem>
                {index < categories.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No hay categorías disponibles.
            </Typography>
          )}
        </List>
      )}
    </Box>
  );
};

export default ListaDeCategorias;