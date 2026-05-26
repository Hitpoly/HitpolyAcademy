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

// --- CONFIGURACIÓN DE ENDPOINTS ---
const ENDPOINT_CARGAR_ANUNCIOS = "https://apiacademy.hitpoly.com/ajax/cargarAnunciosController.php";
const ENDPOINT_EDITAR_ANUNCIO = "https://apiacademy.hitpoly.com/ajax/editarAnuncioController.php";
const CLOUDINARY_UPLOAD_ENDPOINT = "https://apiacademy.hitpoly.com/ajax/cloudinary.php";

function AnuncioForm({ onAnuncioCreado, anuncioToEdit, onAnuncioEditado, onCancelEdit }) {
  // Estados del Anuncio
  const [id, setId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enlace, setEnlace] = useState('');
  const [urlImagen, setUrlImagen] = useState('');
  const [estado, setEstado] = useState('A');
  const [orden, setOrden] = useState('');

  // Estados de Imagen
  const [imagenFile, setImagenFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Estados de Control UI
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Efecto para Cargar Datos en Edición
  useEffect(() => {
    if (anuncioToEdit) {
      setId(anuncioToEdit.id);
      setTitulo(anuncioToEdit.titulo || '');
      setDescripcion(anuncioToEdit.descripcion || '');
      setEnlace(anuncioToEdit.enlace || '');
      const currentImg = anuncioToEdit.urlImagen || anuncioToEdit.urlimagen || '';
      setUrlImagen(currentImg);
      setEstado(anuncioToEdit.estado || 'A');
      setOrden(anuncioToEdit.orden !== undefined ? String(anuncioToEdit.orden) : '');
      setPreviewImageUrl(currentImg || null);
    } else {
      resetLocalForm();
    }
  }, [anuncioToEdit]);

  const resetLocalForm = () => {
    setId(null);
    setTitulo('');
    setDescripcion('');
    setEnlace('');
    setUrlImagen('');
    setEstado('A');
    setOrden('');
    setImagenFile(null);
    setPreviewImageUrl(null);
  };

  /**
   * Sube la imagen al sistema ImageKit (vía tu PHP intermedio)
   */
  const uploadImageToCloudinary = async (file) => {
    const formDataImg = new FormData();
    formDataImg.append("file", file);
    
    // IMPORTANTE: Parámetros requeridos por tu nuevo StorageModel.php
    formDataImg.append("userId", "1"); // Cambiar por el ID real del admin si es dinámico
    formDataImg.append("type", "banner"); 

    try {
      setUploadingImage(true);
      const response = await axios.post(
        CLOUDINARY_UPLOAD_ENDPOINT,
        formDataImg
      );

      // El nuevo PHP devuelve { success: true, url: "..." }
      if (response.data?.success && response.data?.url) {
        return response.data.url;
      } else {
        throw new Error(response.data?.message || "Error al procesar imagen en ImageKit.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error crítico de conexión al subir imagen.";
      throw new Error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
      setUrlImagen(''); // Limpiamos la URL vieja para asegurar que use la nueva al subir
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setSnackbarOpen(false);

    let finalImageUrl = urlImagen;

    // 1. Validar y Subir Imagen si hay archivo nuevo
    if (imagenFile) {
      try {
        finalImageUrl = await uploadImageToCloudinary(imagenFile);
        setUrlImagen(finalImageUrl);
      } catch (uploadError) {
        setErrorMessage(uploadError.message);
        setSnackbarOpen(true);
        setIsLoading(false);
        return;
      }
    } else if (!urlImagen && !id) {
      setErrorMessage("Por favor, selecciona una imagen para el anuncio.");
      setSnackbarOpen(true);
      setIsLoading(false);
      return;
    }

    // 2. Validar Orden
    const parsedOrden = parseInt(orden, 10);
    if (isNaN(parsedOrden) || parsedOrden <= 0) {
      setErrorMessage("Introduce un número de orden válido y positivo.");
      setSnackbarOpen(true);
      setIsLoading(false);
      return;
    }

    // 3. Determinar Acción y Endpoint
    const esEdicion = id !== null;
    const endpoint = esEdicion ? ENDPOINT_EDITAR_ANUNCIO : ENDPOINT_CARGAR_ANUNCIOS;
    const accion = esEdicion ? "editar" : "anuncios";

    const payload = {
      accion: accion,
      id: esEdicion ? id : undefined,
      titulo,
      descripcion,
      enlace,
      urlImagen: finalImageUrl,
      estado,
      orden: parsedOrden,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawResponse = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(rawResponse);
      } catch (e) {
        // Fallback si la API devuelve texto plano pero el status HTTP es OK
        responseData = { success: response.ok, message: rawResponse };
      }

      // 4. Verificación de éxito (Cubre tus formatos status='success' o success=true)
      const isActuallySuccessful = response.ok && (
        responseData.success === true || 
        responseData.status === 'success' || 
        rawResponse.toLowerCase().includes('éxito') || 
        rawResponse.toLowerCase().includes('correctamente')
      );

      if (!isActuallySuccessful) {
        throw new Error(responseData.message || "Error al procesar la solicitud en el servidor.");
      }

      // 5. Finalización con Éxito
      setSuccessMessage(`¡Anuncio ${esEdicion ? 'editado' : 'creado'} con éxito!`);
      setSnackbarOpen(true);

      if (esEdicion && onAnuncioEditado) {
        onAnuncioEditado();
      } else if (!esEdicion && onAnuncioCreado) {
        onAnuncioCreado();
        resetLocalForm();
      }

    } catch (error) {
      setErrorMessage(error.message);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box
      component="form"
      sx={{
        maxWidth: 500, p: 3, border: '1px solid #ccc', borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', display: 'flex',
        flexDirection: 'column', gap: 2, bgcolor: 'background.paper'
      }}
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" align="center" gutterBottom>
        {id ? '✏️ Editar Anuncio' : '📢 Nuevo Anuncio'}
      </Typography>

      <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth required size="small" />
      
      <TextField label="Descripción" multiline rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} fullWidth required size="small" />
      
      <TextField label="Enlace (URL)" type="url" value={enlace} onChange={(e) => setEnlace(e.target.value)} fullWidth required size="small" />

      <TextField 
        label="Orden de visualización" type="number" value={orden} 
        onChange={(e) => setOrden(e.target.value)} fullWidth required size="small"
        inputProps={{ min: "1" }}
        helperText="Define en qué posición aparecerá"
      />

      <Box sx={{ textAlign: 'center', my: 1 }}>
        <input accept="image/*" style={{ display: 'none' }} id="upload-btn" type="file" onChange={handleImageChange} />
        <label htmlFor="upload-btn">
          <Button
            variant="outlined" component="span" fullWidth
            startIcon={uploadingImage ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
            disabled={uploadingImage || isLoading}
          >
            {uploadingImage ? 'Subiendo...' : (imagenFile ? 'Imagen Seleccionada' : 'Seleccionar Imagen')}
          </Button>
        </label>

        {(previewImageUrl || urlImagen) && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Vista previa:</Typography>
            <Avatar src={previewImageUrl || urlImagen} sx={{ width: 150, height: 80, mt: 1, borderRadius: 1 }} variant="square" />
          </Box>
        )}
      </Box>

      {id && (
        <FormControlLabel
          control={<Switch checked={estado === 'A'} onChange={(e) => setEstado(e.target.checked ? 'A' : 'I')} />}
          label={estado === 'A' ? 'Anuncio Visible' : 'Anuncio Oculto'}
        />
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        {id && (
          <Button variant="outlined" color="secondary" onClick={onCancelEdit} disabled={isLoading} fullWidth>
            Cancelar
          </Button>
        )}
        <Button variant="contained" color="primary" type="submit" disabled={isLoading || uploadingImage} fullWidth>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : (id ? 'Guardar Cambios' : 'Publicar')}
        </Button>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={successMessage ? "success" : "error"} variant="filled">
          {successMessage || errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AnuncioForm;