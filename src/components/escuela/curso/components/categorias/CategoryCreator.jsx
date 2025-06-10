import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';

function CategoryCreator({ onCategoryCreated }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [snackbarCreacionOpen, setSnackbarCreacionOpen] = useState(false);
  const [snackbarCreacionMessage, setSnackbarCreacionMessage] = useState('');
  const [snackbarCreacionSeverity, setSnackbarCreacionSeverity] = useState('success');
  const [cargandoCreacion, setCargandoCreacion] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnackbarCreacionOpen(false);
    setCargandoCreacion(true);

    const urlCreacion = "https://apiacademy.hitpoly.com/ajax/subirCategoriaController.php";
    const dataCreacion = {
      accion: "categoria",
      nombre: nombre,
      descripcion: descripcion
    };

    try {
      const response = await fetch(urlCreacion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataCreacion),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      await response.json(); // Asume que la respuesta puede ser importante, aunque no se use directamente aquí
      setSnackbarCreacionMessage('Categoría creada exitosamente.');
      setSnackbarCreacionSeverity('success');
      setSnackbarCreacionOpen(true);
      setNombre('');
      setDescripcion('');
      if (onCategoryCreated) {
        onCategoryCreated(); // Notifica al padre que se ha creado una categoría
      }

    } catch (error) {
      setSnackbarCreacionMessage('Error al crear la categoría: ' + error.message);
      setSnackbarCreacionSeverity('error');
      setSnackbarCreacionOpen(true);
    } finally {
      setCargandoCreacion(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        Crear Nueva Categoría
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Nombre de la Categoría"
          variant="outlined"
          fullWidth
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={cargandoCreacion}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'grey.300' },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
          }}
        />
        <TextField
          label="Descripción"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          disabled={cargandoCreacion}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'grey.300' },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={cargandoCreacion}
          startIcon={cargandoCreacion && <CircularProgress size={20} color="inherit" />}
          sx={{
            mt: 1,
            py: 1.5,
            fontWeight: 'bold',
            '&.Mui-disabled': {
              opacity: 0.7,
            },
          }}
        >
          {cargandoCreacion ? 'Creando...' : 'Crear Categoría'}
        </Button>
      </Box>

      <Snackbar
        open={snackbarCreacionOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarCreacionOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarCreacionOpen(false)} severity={snackbarCreacionSeverity} sx={{ width: '100%' }}>
          {snackbarCreacionMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default CategoryCreator;