// src/components/AnunciosList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import axios from 'axios';
import AnuncioCard from '../cards/AnuncioCard';

const ENDPOINT_GET_ALL_ANUNCIOS = "https://apiacademy.hitpoly.com/ajax/getAllAnunciosController.php";
const ENDPOINT_ELIMINAR_ANUNCIO = "https://apiacademy.hitpoly.com/ajax/eliminarAnuncioController.php";

function AnunciosList({ refreshTrigger, onEditAnuncio }) {
  const [anuncios, setAnuncios] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anuncioToDeleteId, setAnuncioToDeleteId] = useState(null);

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

  const handleDeleteAnuncio = async (id) => {
    setAnuncioToDeleteId(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDialogOpen(false);
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setSnackbarOpen(false);

    try {
      const response = await axios.post(ENDPOINT_ELIMINAR_ANUNCIO, {
        accion: "delete",
        id: anuncioToDeleteId,
      });

      if (response.data && response.data.status === 'success') {
        setSuccessMessage('¡Anuncio eliminado con éxito!');
        setSnackbarOpen(true);
        setAnuncios(prevAnuncios => prevAnuncios.filter(anuncio => anuncio.id !== anuncioToDeleteId));
        setAnuncioToDeleteId(null); 
      } else {
        const apiErrorMessage = response.data?.message || 'Error desconocido al eliminar el anuncio (respuesta de API no exitosa).';
        setErrorMessage(`Error al eliminar el anuncio: ${apiErrorMessage}`);
        setSnackbarOpen(true);
      }
    } catch (error) {
      let displayErrorMessage = `Error al eliminar el anuncio: ${error.message}`;

      if (error.response) {
        displayErrorMessage = `Error del servidor (${error.response.status}): ${error.response.data?.message || error.response.data || 'Error desconocido'}`;
      } else if (error.request) {
        displayErrorMessage = "Error de conexión: No se pudo conectar con el servidor.";
      } else {
        }

      setErrorMessage(displayErrorMessage);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading && anuncios.length === 0 && !anuncioToDeleteId && !successMessage && !errorMessage) {
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

  if (anuncios.length === 0 && !isLoading) {
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
          id={anuncio.id}
          titulo={anuncio.titulo}
          descripcion={anuncio.descripcion}
          enlace={anuncio.enlace}
          urlimagen={anuncio.urlimagen}
          orden={anuncio.orden}
          onEdit={onEditAnuncio}
          onDelete={handleDeleteAnuncio}
        />
      ))}

      
      {isLoading && ( 
         <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
           <CircularProgress size={24} />
         </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        {successMessage ? (
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        ) : (
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        )}
      </Snackbar>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Eliminación"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} autoFocus color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AnunciosList;