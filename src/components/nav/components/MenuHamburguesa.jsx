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

const CATEGORIES_STORAGE_KEY = "cachedCategories"; // Clave para localStorage
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 horas en milisegundos

const ListaDeCategorias = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      // 1. Intentar cargar desde localStorage
      const cachedData = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          // Verificar si el caché no ha expirado (ej. 24 horas)
          if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
            setCategories(data);
            setLoading(false);
            console.log("Categorías cargadas desde localStorage.");
            return; // Salir, ya tenemos los datos
          } else {
            console.log("Caché de categorías expirado, recargando...");
          }
        } catch (parseError) {
          console.error("Error al parsear datos de localStorage:", parseError);
          // Si hay un error al parsear, simplemente lo ignoramos y recargamos
        }
      } else {
        console.log("No hay categorías en localStorage, cargando desde API...");
      }

      // 2. Si no hay caché o está expirado, cargar desde la API
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
        // 3. Guardar en localStorage con timestamp
        localStorage.setItem(
          CATEGORIES_STORAGE_KEY,
          JSON.stringify({ data: data.categorias, timestamp: Date.now() })
        );
        console.log("Categorías cargadas desde API y guardadas en localStorage.");
      } catch (err) {
        console.error("Error al cargar las categorías desde la API:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez al montar

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
                <ListItem button>
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