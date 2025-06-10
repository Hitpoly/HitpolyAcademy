import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function CategoryListManager({ refreshCategoriesTrigger }) {
  const [categorias, setCategorias] = useState([]);
  const [mensajeCarga, setMensajeCarga] = useState('Cargando categorías...');
  const [cargadoLista, setCargadoLista] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [snackbarEdicionOpen, setSnackbarEdicionOpen] = useState(false);
  const [snackbarEdicionMessage, setSnackbarEdicionMessage] = useState('');
  const [snackbarEdicionSeverity, setSnackbarEdicionSeverity] = useState('success');
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  const [snackbarEliminacionOpen, setSnackbarEliminacionOpen] = useState(false);
  const [snackbarEliminacionMessage, setSnackbarEliminacionMessage] = useState('');
  const [snackbarEliminacionSeverity, setSnackbarEliminacionSeverity] = useState('success');
  const [cargandoEliminacion, setCargandoEliminacion] = useState(false);

  const fetchCategorias = async () => {
    setMensajeCarga('Cargando categorías...');
    setCargadoLista(false);
    setCategorias([]);

    const urlGetCategorias = "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php";
    const dataGetCategorias = {
      accion: "getcategorias"
    };

    try {
      const response = await fetch(urlGetCategorias, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataGetCategorias),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        setCategorias(result);
        setMensajeCarga('');
      } else if (result && result.categorias && Array.isArray(result.categorias)) {
        setCategorias(result.categorias);
        setMensajeCarga('');
      } else {
        setMensajeCarga('Formato de respuesta de categorías inesperado.');
        setCategorias([]);
      }

    } catch (error) {
      setMensajeCarga('Error al cargar las categorías: ' + error.message);
      console.error('Error al obtener categorías:', error);
      setCategorias([]);
    } finally {
      setCargadoLista(true);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [refreshCategoriesTrigger]);

  const handleEditClick = (categoria) => {
    setEditingCategory(categoria);
    setEditNombre(categoria.nombre);
    setEditDescripcion(categoria.descripcion);
    setSnackbarEdicionOpen(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSnackbarEdicionOpen(false);
    setCargandoEdicion(true);

    const urlEdicion = "https://apiacademy.hitpoly.com/ajax/EditarCategoriaController.php";
    const dataEdicion = {
      accion: "update",
      id: editingCategory.id,
      nombre: editNombre,
      descripcion: editDescripcion
    };

    try {
      const response = await fetch(urlEdicion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataEdicion),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      await response.json();
      setSnackbarEdicionMessage('Categoría actualizada exitosamente.');
      setSnackbarEdicionSeverity('success');
      setSnackbarEdicionOpen(true);
      setEditingCategory(null);
      fetchCategorias();

    } catch (error) {
      setSnackbarEdicionMessage('Error al actualizar la categoría: ' + error.message);
      setSnackbarEdicionSeverity('error');
      setSnackbarEdicionOpen(true);
      console.error('Error al actualizar categoría:', error);
    } finally {
      setCargandoEdicion(false);
    }
  };

  const handleDelete = async (id) => {
    console.log('Iniciando eliminación para ID:', id); // PASO 1
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      console.log('Eliminación cancelada por el usuario.'); // PASO 2
      return;
    }

    setSnackbarEliminacionOpen(false);
    setCargandoEliminacion(true);
    console.log('Estado de carga de eliminación establecido en true.'); // PASO 3

    const urlEliminacion = "https://apiacademy.hitpoly.com/ajax/eliminarCategoriaController.php";
    const dataEliminacion = {
      accion: "delete",
      id: id
    };

    console.log('Enviando datos a la API:', dataEliminacion); // PASO 4

    try {
      const response = await fetch(urlEliminacion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataEliminacion),
      });

      console.log('Respuesta de la API (objeto response):', response); // PASO 5
      console.log('Status de la respuesta:', response.status); // PASO 6

      if (!response.ok) {
        // Esto captura errores HTTP como 404, 500, etc.
        const errorText = await response.text(); // Intenta leer el cuerpo del error
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`); // Error más descriptivo
      }

      const result = await response.json(); // PASO 7: Intenta parsear la respuesta como JSON
      console.log('Resultado de la API (JSON parseado):', result); // PASO 8

      // Aquí, asume que tu PHP devuelve algo como { success: true } o { error: "mensaje" }
      if (result && result.success) { // Ajusta esta condición según la respuesta real de tu PHP
        setSnackbarEliminacionMessage('Categoría eliminada exitosamente.');
        setSnackbarEliminacionSeverity('success');
        setSnackbarEliminacionOpen(true);
        console.log('Eliminación confirmada por la API como exitosa. Recargando categorías...'); // PASO 9
        fetchCategorias(); // Recarga la lista después de la eliminación
      } else {
        // Esto captura si la API devuelve un 200 OK, pero con un mensaje de error dentro del JSON
        const errorMessage = result && result.message ? result.message : 'Error desconocido al eliminar la categoría desde la API.';
        throw new Error(errorMessage); // Lanza un error si la API indica fallo lógico
      }

    } catch (error) {
      console.error('Detalle del error en catch:', error); // PASO 10: Captura el error y lo loguea
      setSnackbarEliminacionMessage('Error al eliminar la categoría: ' + error.message);
      setSnackbarEliminacionSeverity('error');
      setSnackbarEliminacionOpen(true);
    } finally {
      setCargandoEliminacion(false);
      console.log('Estado de carga de eliminación establecido en false.'); // PASO 11
    }
  };

  return (
    <Box>
      {editingCategory && (
        <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
          <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ color: 'warning.dark', fontWeight: 'bold' }}>
            Editar Categoría (ID: {editingCategory.id})
          </Typography>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre de la Categoría"
              variant="outlined"
              fullWidth
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              required
              disabled={cargandoEdicion}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'grey.300' },
                  '&:hover fieldset': { borderColor: 'warning.main' },
                  '&.Mui-focused fieldset': { borderColor: 'warning.main' },
                },
              }}
            />
            <TextField
              label="Descripción"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={editDescripcion}
              onChange={(e) => setEditDescripcion(e.target.value)}
              required
              disabled={cargandoEdicion}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'grey.300' },
                  '&:hover fieldset': { borderColor: 'warning.main' },
                  '&.Mui-focused fieldset': { borderColor: 'warning.main' },
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="warning"
                fullWidth
                disabled={cargandoEdicion}
                startIcon={cargandoEdicion && <CircularProgress size={20} color="inherit" />}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                {cargandoEdicion ? 'Actualizando...' : 'Actualizar Categoría'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => setEditingCategory(null)}
                disabled={cargandoEdicion}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Categorías Existentes
        </Typography>
        {!cargadoLista && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>{mensajeCarga}</Typography>
          </Box>
        )}
        {cargadoLista && categorias.length === 0 && (
          <Typography variant="body1" align="center" sx={{ color: 'text.secondary', mt: 2 }}>
            No hay categorías para mostrar.
          </Typography>
        )}

        {cargadoLista && categorias.length > 0 && (
          <List sx={{ mt: 2 }}>
            {categorias.map((categoria, index) => (
              <ListItem
                key={categoria.id || `cat-${index}`}
                divider
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  mb: 1,
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" component="span" sx={{ color: 'primary.dark', fontWeight: 'medium' }}>
                      {categoria.nombre}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span" sx={{ color: 'text.secondary', display: 'block' }}>
                        {categoria.descripcion}
                      </Typography>
                      {categoria.id && (
                        <Typography variant="caption" component="span" sx={{ color: 'grey.600', mt: 0.5, display: 'block' }}>
                          ID: {categoria.id}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEditClick(categoria)}
                    disabled={cargandoEdicion || cargandoEliminacion}
                    sx={{ color: 'info.main' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(categoria.id)}
                    disabled={cargandoEdicion || cargandoEliminacion}
                    sx={{ color: 'error.main', ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={snackbarEdicionOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarEdicionOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarEdicionOpen(false)} severity={snackbarEdicionSeverity} sx={{ width: '100%' }}>
          {snackbarEdicionMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbarEliminacionOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarEliminacionOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarEliminacionOpen(false)} severity={snackbarEliminacionSeverity} sx={{ width: '100%' }}>
          {snackbarEliminacionMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CategoryListManager;