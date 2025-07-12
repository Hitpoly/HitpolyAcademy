import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const ENDPOINT_CARGAR_ANUNCIOS = "https://apiacademy.hitpoly.com/ajax/cargarAnunciosController.php";
const ENDPOINT_EDITAR_ANUNCIO = "https://apiacademy.hitpoly.com/ajax/editarAnuncioController.php";
const CLOUDINARY_UPLOAD_ENDPOINT = "https://apisistemamembresia.hitpoly.com/ajax/Cloudinary.php";

function AnuncioForm({ onAnuncioCreado, anuncioToEdit, onAnuncioEditado, onCancelEdit }) {
  const [id, setId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enlace, setEnlace] = useState('');
  const [urlImagen, setUrlImagen] = useState('');
  const [estado, setEstado] = useState('A');
  const [orden, setOrden] = useState('');

  const [imagenFile, setImagenFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (anuncioToEdit) {
      setId(anuncioToEdit.id);
      setTitulo(anuncioToEdit.titulo);
      setDescripcion(anuncioToEdit.descripcion);
      setEnlace(anuncioToEdit.enlace);
      setUrlImagen(anuncioToEdit.urlImagen || anuncioToEdit.urlimagen || '');
      setEstado(anuncioToEdit.estado || 'A');
      setOrden(anuncioToEdit.orden !== undefined && anuncioToEdit.orden !== null ? String(anuncioToEdit.orden) : '');

      const imageUrlToPreview = anuncioToEdit.urlImagen || anuncioToEdit.urlimagen;
      if (imageUrlToPreview) {
        setPreviewImageUrl(imageUrlToPreview);
      } else {
        setPreviewImageUrl(null);
      }
    } else {
      setId(null);
      setTitulo('');
      setDescripcion('');
      setEnlace('');
      setUrlImagen('');
      setEstado('A');
      setOrden('');
      setImagenFile(null);
      setPreviewImageUrl(null);
    }
  }, [anuncioToEdit]);

  const uploadImageToCloudinary = async (file) => {
    const formDataImg = new FormData();
    formDataImg.append("file", file);

    try {
      setUploadingImage(true);
      const response = await axios.post(
        CLOUDINARY_UPLOAD_ENDPOINT,
        formDataImg,
        { headers: { "Content-Type": "multipart/form-type" } }
      );

      if (response.data?.url) {
        return response.data.url;
      } else {
        throw new Error("No se recibió una URL válida desde el backend de Cloudinary.");
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error al subir la imagen del anuncio.");
      setSnackbarOpen(true);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
      setUrlImagen('');
    } else {
      setImagenFile(null);
      setPreviewImageUrl(urlImagen);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setSnackbarOpen(false);

    let finalImageUrl = urlImagen;

    if (imagenFile) {
      try {
        finalImageUrl = await uploadImageToCloudinary(imagenFile);
        setUrlImagen(finalImageUrl);
      } catch (uploadError) {
        setIsLoading(false);
        return;
      }
    } else if (!urlImagen && !id) {
      setErrorMessage("Por favor, selecciona una imagen para el anuncio.");
      setSnackbarOpen(true);
      setIsLoading(false);
      return;
    }

    const parsedOrden = parseInt(orden, 10);
    if (isNaN(parsedOrden) || parsedOrden <= 0) {
      setErrorMessage("Por favor, introduce un número de orden válido y positivo.");
      setSnackbarOpen(true);
      setIsLoading(false);
      return;
    }

    const esEdicion = id !== null;
    const endpoint = esEdicion ? ENDPOINT_EDITAR_ANUNCIO : ENDPOINT_CARGAR_ANUNCIOS;
    const accion = esEdicion ? "editar" : "anuncios";

    let requestBody;
    let requestHeaders = {
      'Content-Type': 'application/json'
    };

    requestBody = JSON.stringify({
      accion: accion,
      id: esEdicion ? id : undefined,
      titulo: titulo,
      descripcion: descripcion,
      enlace: enlace,
      urlImagen: finalImageUrl,
      estado: estado,
      orden: parsedOrden,
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
      });

      // Leer la respuesta como texto primero para inspeccionarla
      const rawResponse = await response.text();
      console.log("Respuesta RAW de la API:", rawResponse); // ✨ IMPORTANTE: Para depuración ✨

      if (!response.ok) {
        // Si el estado HTTP no es 2xx, siempre es un error
        let errorMsg = `Error al ${esEdicion ? 'editar' : 'crear'} el anuncio: ${response.status}`;
        try {
          const errorJson = JSON.parse(rawResponse);
          errorMsg = errorJson.message || rawResponse;
        } catch (jsonErr) {
          errorMsg = rawResponse; // Si no es JSON, usa el texto crudo
        }
        throw new Error(errorMsg);
      }

      // Si la respuesta HTTP es OK (2xx), intentamos parsear JSON
      // Si falla, asumimos éxito basado en response.ok
      let responseData = {};
      try {
        responseData = JSON.parse(rawResponse);
      } catch (jsonErr) {
        // No es JSON, pero response.ok fue true, asumimos éxito.
        // Puedes agregar una verificación más específica si sabes qué texto devuelve la API en caso de éxito.
        if (rawResponse.includes('éxito') || rawResponse.includes('success') || rawResponse.includes('correctamente')) {
            responseData = { success: true, message: rawResponse };
        } else {
            // Si no contiene palabras de éxito, podría ser un éxito vacío o algo inesperado
            responseData = { success: true, message: rawResponse || `Operación ${esEdicion ? 'de edición' : 'de creación'} exitosa (respuesta no-JSON).` };
        }
      }

      // Verifica el campo 'status' o 'success' dentro del JSON (si existe y es un JSON)
      // O si el fallback anterior ya determinó el éxito
      if (responseData.status === 'error' || (responseData.success !== undefined && !responseData.success)) {
        throw new Error(responseData.message || "Error al procesar la solicitud (respuesta de API).");
      }

      // Si llegamos aquí, la operación fue exitosa
      setSuccessMessage(`¡Anuncio ${esEdicion ? 'editado' : 'creado'} con éxito!`);
      setSnackbarOpen(true);

      if (esEdicion && onAnuncioEditado) {
        onAnuncioEditado();
      } else if (!esEdicion && onAnuncioCreado) {
        onAnuncioCreado();
        setTitulo('');
        setDescripcion('');
        setEnlace('');
        setUrlImagen('');
        setImagenFile(null);
        setPreviewImageUrl(null);
        setEstado('A');
        setOrden('');
      }

    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleCancelClick = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <Box
      component="form"
      sx={{
        maxWidth: 500,
        p: 3,
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" align="center">
        {id ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
      </Typography>

      <TextField
        label="Título del Anuncio"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Descripción"
        multiline
        rows={4}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Enlace (URL)"
        type="url"
        value={enlace}
        onChange={(e) => setEnlace(e.target.value)}
        fullWidth
        required
      />

      <TextField
        label="Orden del Anuncio"
        type="number"
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
        fullWidth
        required
        inputProps={{ min: "1" }}
        helperText="Introduce un número único y positivo para el orden del anuncio."
      />

      <Box sx={{ textAlign: 'center' }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="upload-image-button"
          type="file"
          onChange={handleImageChange}
        />
        <label htmlFor="upload-image-button">
          <Button
            variant="outlined"
            component="span"
            startIcon={uploadingImage ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
            disabled={uploadingImage}
            fullWidth
          >
            {uploadingImage ? 'Subiendo Imagen...' : (imagenFile ? 'Imagen Seleccionada' : 'Seleccionar Imagen')}
          </Button>
        </label>

        {(previewImageUrl || urlImagen) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Previsualización:</Typography>
            <Avatar src={previewImageUrl || urlImagen} sx={{ width: 100, height: 100, mx: 'auto' }} variant="square" />
          </Box>
        )}
      </Box>

      {id && (
        <FormControlLabel
          control={
            <Switch
              checked={estado === 'A'}
              onChange={(e) => setEstado(e.target.checked ? 'A' : 'I')}
              color="primary"
            />
          }
          label={estado === 'A' ? 'Anuncio Activo' : 'Anuncio Inactivo'}
        />
      )}

      <Box sx={{ position: 'relative', display: 'flex', gap: 2 }}>
        {id && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancelClick}
            disabled={isLoading || uploadingImage}
            fullWidth
          >
            Cancelar
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading || uploadingImage}
          fullWidth
        >
          {isLoading
            ? (id ? 'Editando Anuncio...' : 'Creando Anuncio...')
            : (id ? 'Guardar Cambios' : 'Publicar Anuncio')}
        </Button>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }}
          />
        )}
      </Box>

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
    </Box>
  );
}

export default AnuncioForm;