import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const ENDPOINT_CARGAR_ANUNCIOS = "https://apiacademy.hitpoly.com/ajax/cargarAnunciosController.php";
const CLOUDINARY_UPLOAD_ENDPOINT = "https://apisistemamembresia.hitpoly.com/ajax/Cloudinary.php";

function CrearAnuncioForm({ onAnuncioCreado }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enlace, setEnlace] = useState('');
  const [urlImagen, setUrlImagen] = useState('');

  const [imagenFile, setImagenFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const uploadImageToCloudinary = async (file) => {
    const formDataImg = new FormData();
    formDataImg.append("file", file);

    try {
      setUploadingImage(true);
      const response = await axios.post(
        CLOUDINARY_UPLOAD_ENDPOINT,
        formDataImg,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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
    } else {
      setImagenFile(null);
      setPreviewImageUrl(null);
      setUrlImagen('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setSnackbarOpen(false);

    let finalImageUrl = ''; 

    if (!imagenFile) {
      setErrorMessage("Por favor, selecciona una imagen para el anuncio.");
      setSnackbarOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      finalImageUrl = await uploadImageToCloudinary(imagenFile);
      setUrlImagen(finalImageUrl); 
    } catch (uploadError) {
      setIsLoading(false);
      return;
    }

    const data = {
      accion: "anuncios",
      titulo: titulo,
      descripcion: descripcion,
      enlace: enlace,
      urlImagen: finalImageUrl
    };

    try {
      const response = await fetch(ENDPOINT_CARGAR_ANUNCIOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Error al cargar el anuncio: ${response.status} - ${errorDetail || response.statusText}`);
      }

      await response.json(); // Consumir la respuesta JSON
      
      setSuccessMessage('¡Anuncio creado con éxito!');
      setSnackbarOpen(true);
      
      if (onAnuncioCreado) {
        onAnuncioCreado();
      }

      setTitulo('');
      setDescripcion('');
      setEnlace('');
      setUrlImagen('');
      setImagenFile(null);
      setPreviewImageUrl(null);

    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
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
  <Typography variant="h5" component="h2" gutterBottom align="center">
    Crear Nuevo Anuncio
  </Typography>

  <TextField
    label="Título del Anuncio"
    variant="outlined"
    value={titulo}
    onChange={(e) => setTitulo(e.target.value)}
    fullWidth
    required
  />
  <TextField
    label="Descripción"
    variant="outlined"
    multiline
    rows={4}
    value={descripcion}
    onChange={(e) => setDescripcion(e.target.value)}
    fullWidth
    required
  />
  <TextField
    label="Enlace (URL)"
    variant="outlined"
    type="url"
    value={enlace}
    onChange={(e) => setEnlace(e.target.value)}
    fullWidth
    required
  />

  <Box sx={{ width: '100%', textAlign: 'center' }}>
    <input
      accept="image/*"
      style={{ display: 'none' }}
      id="upload-image-button"
      type="file"
      onChange={handleImageChange}
    />
    <label htmlFor="upload-image-button" style={{ width: '100%' }}>
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

    {previewImageUrl && (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">Previsualización:</Typography>
        <Avatar src={previewImageUrl} alt="Previsualización" sx={{ width: 100, height: 100, mx: 'auto' }} variant="square" />
      </Box>
    )}

    {!previewImageUrl && urlImagen && (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">Imagen Actual:</Typography>
        <Avatar src={urlImagen} alt="Imagen del Anuncio" sx={{ width: 100, height: 100, mx: 'auto' }} variant="square" />
      </Box>
    )}
  </Box>

  <Box sx={{ position: 'relative' }}>
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isLoading || uploadingImage}
      fullWidth
    >
      {isLoading ? 'Creando Anuncio...' : 'Publicar Anuncio'}
    </Button>
    {isLoading && (
      <CircularProgress
        size={24}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-12px',
          marginLeft: '-12px',
        }}
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

export default CrearAnuncioForm;