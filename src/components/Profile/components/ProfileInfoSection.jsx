import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Stack,
  Link,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress, // Para el indicador de carga
  Alert, // Para mostrar mensajes de error/éxito
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import SchoolIcon from "@mui/icons-material/School";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"; // Icono para subir foto
import Swal from "sweetalert2"; // Para alertas más amigables
import axios from "axios"; // Asegúrate de tener axios instalado: npm install axios

// Importamos el hook de autenticación
import { useAuth } from "../../../context/AuthContext"; // Ajusta la ruta si es necesario

// Función auxiliar para validar URLs
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (e) {
    return false;
  }
};

const ProfileInfoSection = () => {
  const { user } = useAuth(); // Obtenemos el usuario del contexto
  const userId = user?.id; // Extraemos el id_usuario

  const [profile, setProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados para la carga de imagen de perfil
  const [newAvatarFile, setNewAvatarFile] = useState(null); // Almacena el archivo de imagen seleccionado
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null); // URL para previsualizar la nueva imagen
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // Indicador de carga para el avatar

  // Estados para errores de validación de URLs de redes sociales
  const [urlLinkedinError, setUrlLinkedinError] = useState(null);
  const [urlFacebookError, setUrlFacebookError] = useState(null);
  const [urlInstagramError, setUrlInstagramError] = useState(null);

  // Función para traer la información del alumno/profesor
  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setError("ID de usuario no disponible. Inicie sesión.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getAlumnoProfesor", id: userId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de red: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Datos del perfil recibidos:", data);

      if (data.status === "success" && data.usuario) {
        // Aseguramos que los campos existan y sean cadenas vacías si no vienen de la API
        const fetchedProfile = {
          ...data.usuario,
          url_linkedin: data.usuario.url_linkedin || "",
          url_facebook: data.usuario.url_facebook || "",
          url_instagram: data.usuario.url_instagram || "",
          bio: data.usuario.biografia || "", // Aquí asumo que "biografia" es el campo para la bio
          avatar: data.usuario.url_foto_perfil || "/images/default-avatar.png",
          cursosCulminados: [], // Mantener vacío si la API no los provee
        };
        setProfile(fetchedProfile);
      } else {
        setError(data.message || "No se encontró información del usuario.");
      }
    } catch (err) {
      console.error("Error al obtener el perfil:", err);
      setError(`No se pudo cargar el perfil: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Dependencia del userId para que se ejecute cuando esté disponible

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Función para subir el nuevo avatar a Cloudinary
  const uploadAvatarToCloudinary = async (file) => {
    const formDataImg = new FormData();
    formDataImg.append('file', file);

    try {
      setUploadingAvatar(true);
      const response = await axios.post(
        'https://apisistemamembresia.hitpoly.com/ajax/Cloudinary.php',
        formDataImg,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Cloudinary response:', response.data);

      if (response.data?.url) {
        return response.data.url;
      } else {
        throw new Error('No se recibió una URL válida desde el backend de Cloudinary.');
      }
    } catch (error) {
      console.error('Error al subir el avatar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al subir imagen',
        text: 'Ocurrió un error al intentar subir la imagen de perfil.',
      });
      throw error; // Propaga el error para que handleSaveClick lo capture
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditClick = () => {
    setTempProfile({ ...profile });
    setEditMode(true);
    setSuccessMessage(null);
    setNewAvatarFile(null); // Reiniciar el archivo de avatar cuando se entra en modo edición
    setPreviewAvatarUrl(null); // Reiniciar la previsualización
    // Limpiar errores de validación de URLs al entrar en modo edición
    setUrlLinkedinError(null);
    setUrlFacebookError(null);
    setUrlInstagramError(null);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setTempProfile(null);
    setError(null);
    setNewAvatarFile(null); // Limpiar el archivo seleccionado
    setPreviewAvatarUrl(null); // Limpiar la previsualización
    // Limpiar errores de validación de URLs al cancelar
    setUrlLinkedinError(null);
    setUrlFacebookError(null);
    setUrlInstagramError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar el error específico al escribir en el campo
    if (name === "url_linkedin") setUrlLinkedinError(null);
    if (name === "url_facebook") setUrlFacebookError(null);
    if (name === "url_instagram") setUrlInstagramError(null);
  };

  // Manejar la selección de un nuevo archivo de avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setPreviewAvatarUrl(URL.createObjectURL(file)); // Crear URL para previsualización
    } else {
      setNewAvatarFile(null);
      setPreviewAvatarUrl(null);
    }
  };

  const handleSaveClick = async () => {
    if (!userId) {
      setError("No se puede guardar el perfil: ID de usuario no disponible.");
      return;
    }

    // --- Validación de URLs de redes sociales ---
    let hasValidationError = false;
    // Limpiar errores previos
    setUrlLinkedinError(null);
    setUrlFacebookError(null);
    setUrlInstagramError(null);

    if (tempProfile.url_linkedin && !isValidUrl(tempProfile.url_linkedin)) {
      setUrlLinkedinError("URL de LinkedIn inválida. Debe incluir 'http://' o 'https://'.");
      hasValidationError = true;
    }
    if (tempProfile.url_facebook && !isValidUrl(tempProfile.url_facebook)) {
      setUrlFacebookError("URL de Facebook inválida. Debe incluir 'http://' o 'https://'.");
      hasValidationError = true;
    }
    if (tempProfile.url_instagram && !isValidUrl(tempProfile.url_instagram)) {
      setUrlInstagramError("URL de Instagram inválida. Debe incluir 'http://' o 'https://'.");
      hasValidationError = true;
    }

    if (hasValidationError) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor, corrige las URLs de redes sociales inválidas.',
      });
      return; // Detener el guardado si hay errores de validación
    }
    // --- Fin de validación ---

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    let finalAvatarUrl = tempProfile.avatar; // Por defecto, usa el avatar actual

    if (newAvatarFile) {
      // Si se seleccionó un nuevo archivo de avatar, súbelo a Cloudinary
      try {
        finalAvatarUrl = await uploadAvatarToCloudinary(newAvatarFile);
      } catch (uploadError) {
        setLoading(false);
        return; // Detener el proceso si la subida del avatar falla
      }
    }

    try {
      const payload = {
        accion: "editar",
        id: userId, // Usamos el ID del usuario logueado
        nombre: tempProfile.nombre,
        email: tempProfile.email,
        url_linkedin: tempProfile.url_linkedin, // Usando el nombre correcto
        url_facebook: tempProfile.url_facebook, // Usando el nombre correcto
        url_instagram: tempProfile.url_instagram, // Usando el nombre correcto
        biografia: tempProfile.bio,
        url_foto_perfil: finalAvatarUrl, // Usar la URL de Cloudinary o la URL existente
      };

      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/editarUsuarioController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de red al guardar: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Respuesta de edición:", data);

      if (data.status === "success") {
        // Actualizar el perfil con los cambios guardados, incluyendo la nueva URL del avatar
        setProfile({ ...tempProfile, avatar: finalAvatarUrl });
        setEditMode(false);
        setNewAvatarFile(null); // Limpiar el archivo una vez guardado
        setPreviewAvatarUrl(null); // Limpiar la previsualización
        setSuccessMessage("¡Perfil actualizado con éxito!");
      } else {
        setError(data.message || "Hubo un error al guardar los cambios.");
      }
    } catch (err) {
      console.error("Error al guardar el perfil:", err);
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando perfil...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, width: '100%', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchProfile}>Reintentar</Button>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3, width: '100%', textAlign: 'center' }}>
        <Alert severity="warning">No se pudo cargar la información del perfil.</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ffff",
        flex: { xs: "0 0 100%", md: "1" },
        minWidth: { md: 280 },
        p: { xs: 3, md: 3 },
        overflowY: { xs: "visible", md: "auto" },
        maxHeight: { xs: "none", md: "100%" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Avatar y botón de subida */}
        <Box sx={{ position: 'relative', mb: 3 }}>
          <Avatar
            src={previewAvatarUrl || profile.avatar} // Muestra la previsualización si hay un nuevo archivo
            alt={profile.nombre}
            sx={{
              width: { xs: 150, sm: 150 },
              height: { xs: 150, sm: 150 },
              border: "4px solid #6C4DE2",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          />
          {editMode && (
            <IconButton
              component="label" // Hacer que el botón actúe como label para el input file
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#6C4DE2',
                color: 'white',
                '&:hover': { backgroundColor: '#5a3bbd' },
              }}
              disabled={uploadingAvatar} // Deshabilitar si se está subiendo una imagen
            >
              {uploadingAvatar ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PhotoCameraIcon />
              )}
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </IconButton>
          )}
        </Box>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "#333",
            textAlign: "center",
          }}
        >
          {editMode ? (
            <TextField
              label="Nombre"
              name="nombre"
              value={tempProfile.nombre}
              onChange={handleChange}
              variant="standard"
              sx={{ '.MuiInput-underline:before': { borderBottom: 'none' }, '.MuiInput-underline:after': { borderBottom: 'none' } }}
            />
          ) : (
            profile.nombre
          )}

          {!editMode && (
            <IconButton
              aria-label="editar perfil"
              onClick={handleEditClick}
              sx={{ ml: 1, p: 0.5, color: "#6C4DE2" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: { xs: 3, md: 5 },
          width: "100%",
          borderTop: { xs: "1px solid #e0e0e0", md: "none" },
          pt: { xs: 3, md: 0 },
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
          Información del Alumno
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {!editMode ? (
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EmailIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
              <Typography variant="body1">
                <Typography component="span" fontWeight="bold">
                  Email:
                </Typography>{" "}
                {profile.email}
              </Typography>
            </Box>
            {profile.url_linkedin && ( // Usando url_linkedin
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinkedInIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    LinkedIn:
                  </Typography>{" "}
                  <Link
                    href={profile.url_linkedin} // Usando url_linkedin
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.url_linkedin.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")} {/* Usando url_linkedin para visualización */}
                  </Link>
                </Typography>
              </Box>
            )}
            {profile.url_facebook && ( // Usando url_facebook
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FacebookIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    Facebook:
                  </Typography>{" "}
                  <Link
                    href={profile.url_facebook} // Usando url_facebook
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.url_facebook.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")} {/* Usando url_facebook para visualización */}
                  </Link>
                </Typography>
              </Box>
            )}
            {profile.url_instagram && ( // Usando url_instagram
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <InstagramIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    Instagram:
                  </Typography>{" "}
                  <Link
                    href={profile.url_instagram} // Usando url_instagram
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.url_instagram.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")} {/* Usando url_instagram para visualización */}
                  </Link>
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <DescriptionIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2", mt: 0.5 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Sobre mí:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.bio}
                </Typography>
              </Box>
            </Box>

            {profile.cursosCulminados && profile.cursosCulminados.length > 0 && (
              <Box sx={{ mt: 3, width: "100%" }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
                  Cursos Culminados
                </Typography>
                <List dense>
                  {profile.cursosCulminados.map((course) => (
                    <ListItem key={course.id} disablePadding>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <SchoolIcon sx={{ color: "#6C4DE2", fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={course.titulo} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Email"
              name="email"
              value={tempProfile.email}
              onChange={handleChange}
              fullWidth
              type="email"
              variant="outlined"
            />
            <TextField
              label="Perfil de LinkedIn"
              name="url_linkedin" // Nombre correcto
              value={tempProfile.url_linkedin} // Valor correcto
              onChange={handleChange}
              fullWidth
              type="url"
              variant="outlined"
              error={!!urlLinkedinError} // Error correcto
              helperText={urlLinkedinError} // Mensaje de error correcto
            />
            <TextField
              label="Perfil de Facebook"
              name="url_facebook" // Nombre correcto
              value={tempProfile.url_facebook} // Valor correcto
              onChange={handleChange}
              fullWidth
              type="url"
              variant="outlined"
              error={!!urlFacebookError} // Error correcto
              helperText={urlFacebookError} // Mensaje de error correcto
            />
            <TextField
              label="Perfil de Instagram"
              name="url_instagram" // Nombre correcto
              value={tempProfile.url_instagram} // Valor correcto
              onChange={handleChange}
              fullWidth
              type="url"
              variant="outlined"
              error={!!urlInstagramError} // Error correcto
              helperText={urlInstagramError} // Mensaje de error correcto
            />
            <TextField
              label="Biografía"
              name="bio"
              value={tempProfile.bio}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
            <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveClick}
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#388e3c" },
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                }}
                disabled={uploadingAvatar || loading}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelClick}
                sx={{
                  borderColor: "#f44336",
                  color: "#f44336",
                  "&:hover": { backgroundColor: "#ffebee", borderColor: "#d32f2f" },
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                }}
                disabled={uploadingAvatar || loading}
              >
                Cancelar
              </Button>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ProfileInfoSection;