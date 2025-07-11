// src/components/AnunciosList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import AnuncioCard from '../cards/AnuncioCard';

const ENDPOINT_GET_ALL_ANUNCIOS = "https://apiacademy.hitpoly.com/ajax/getAllAnunciosController.php";

function AnunciosList({ refreshTrigger }) {
  const [anuncios, setAnuncios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnuncios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(ENDPOINT_GET_ALL_ANUNCIOS, {
        accion: "getAll"
      });

      if (response.data && Array.isArray(response.data.clases)) {
        setAnuncios(response.data.clases);
      } else if (Array.isArray(response.data)) {
        setAnuncios(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setAnuncios(response.data.data);
      } else {
        setAnuncios([]);
      }
    } catch (err) {
      setError("No se pudieron cargar los anuncios. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnuncios();
  }, [fetchAnuncios, refreshTrigger]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando anuncios...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (anuncios.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">No hay anuncios para mostrar.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {anuncios.map((anuncio) => (
        <AnuncioCard
          key={anuncio.id || anuncio.titulo}
          titulo={anuncio.titulo}
          descripcion={anuncio.descripcion}
          enlace={anuncio.enlace}
          urlimagen={anuncio.urlimagen}
        />
      ))}
    </Box>
  );
}

export default AnunciosList;
