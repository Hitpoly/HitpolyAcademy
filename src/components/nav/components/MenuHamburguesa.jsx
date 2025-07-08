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
import { useNavigate } from "react-router-dom"; 

const CATEGORIES_STORAGE_KEY = "cachedCategories";
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24;

const ListaDeCategorias = ({ onCloseDrawer }) => { 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      const cachedData = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
            setCategories(data);
            setLoading(false);
            return;
          } else {
            }
        } catch (parseError) {
          }
      } else {
        }

      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getcategorias" }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error al cargar categorías: ${response.statusText}. Detalles: ${errorText}`
          );
        }

        const data = await response.json();

        if (data.status !== "success" || !Array.isArray(data.categorias)) {
          throw new Error(data.message || "Datos de categorías inválidos.");
        }

        setCategories(data.categorias);
        localStorage.setItem(
          CATEGORIES_STORAGE_KEY,
          JSON.stringify({ data: data.categorias, timestamp: Date.now() })
        );
        } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => { 
    navigate(`/cursos/${categoryName}`); 
    if (onCloseDrawer) { 
      onCloseDrawer();
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
          {categories.length > 0 ? (
            categories.map((categoria, index) => (
              <React.Fragment key={categoria.id}>
                <ListItem button onClick={() => handleCategoryClick(categoria.nombre)}> 
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